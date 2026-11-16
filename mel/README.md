# 🐶 Mel: painel financeiro

A Mel é uma vira-lata caramelo que lê a sua planilha do Google Sheets e transforma os lançamentos em um painel.
Ela não guarda nenhum dado próprio: a cada visita, busca tudo da planilha. **A planilha é a fonte da verdade.**

Abas do app: **Visão geral · Mês em foco · Recebimentos · Investimentos · Quanto guardar · Simulador · Lançamentos**.

---

## 1. Deixar a planilha legível para o app (uma vez, ~10 min)

O app lê a planilha com uma **conta de serviço** do Google, um "robô" que só tem acesso ao que você compartilhar com ele.
A planilha continua privada.

1. Acesse <https://console.cloud.google.com/> e crie um projeto (por exemplo, `mel-financas`).
2. Em **APIs e serviços → Biblioteca**, procure **Google Sheets API** e clique em **Ativar**.
3. Em **IAM e administrador → Contas de serviço**, crie uma conta (por exemplo, `mel-leitor`). Ela não precisa de nenhum papel.
4. Abra essa conta e vá em **Chaves → Adicionar chave → JSON**. Um arquivo `.json` será baixado. **Não suba esse arquivo para o GitHub.**
5. Abra a sua planilha e clique em **Compartilhar**. Cole o e-mail da conta de serviço (`mel-leitor@...iam.gserviceaccount.com`) como **Leitor**.

## 2. Publicar na Vercel

1. Crie um repositório **privado** no GitHub e suba esta pasta. O `.gitignore` já deixa de fora `.env*` e `data/local.json`.
2. Em <https://vercel.com/new>, importe o repositório. O framework, Next.js, é detectado sozinho.
3. Em **Settings → Environment Variables**, crie estas variáveis:

| Variável | Valor |
|---|---|
| `SHEET_ID` | o ID da planilha (o trecho entre `/d/` e `/edit` na URL) |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | o campo `client_email` do JSON |
| `GOOGLE_PRIVATE_KEY` | o campo `private_key` do JSON, inteiro, com os `\n` |
| `MEL_PASSWORD` | uma senha. O navegador pede usuário e senha: o usuário pode ser qualquer coisa |

4. Clique em **Deploy**. Pronto. Para ver mudanças feitas na planilha, clique em **↻ Atualizar** no app.

> Sem `MEL_PASSWORD`, o app fica aberto para qualquer pessoa com o link. Na Vercel, sempre defina essa variável.

## 3. Rodar no computador (opcional)

```bash
npm install
cp .env.example .env.local   # preencha as variáveis
npm run dev                  # http://localhost:3000
```

Também dá para rodar sem o Google: exporte a aba **Dados** como TSV e rode `npm run local-data -- caminho/Dados.tsv`.
Isso gera `data/local.json`, que fica fora do git.

## 4. O que o app espera da planilha

Não renomeie as abas nem mude a ordem das colunas.

**Dados** (a partir da linha 2):

| Coluna | Campo |
|---|---|
| A | Data (aaaa-mm-dd) |
| B | Mês (fórmula automática) |
| C | Descrição |
| D | Tipo |
| E | Categoria |
| F | Conta |
| G | Valor |
| H | Status (`Realizado`/`Pendente`) |
| I | Extraordinário (`Sim`/`Não`) |
| J | Obs. |

- Tipos possíveis: `Entrada`, `Gasto`, `Imposto`, `Investimento`, `Pagamento de fatura`, `Transferência interna`.
- Valores são sempre positivos. A exceção é estorno ou reembolso: um Pix que um amigo te devolve entra como gasto **negativo** na categoria Pessoas.

**Produtos**: `produto | funcao | pct_cdi | liquidez | data_aplicacao | aplicado | prazo_meses | isento_ir`.
O produto cuja liquidez contém “Diária” é tratado como reserva de emergência.

**Premissas** (chave → valor): `cdi_aa`, `saldo_investido_informado`, `limite_cartao`, `meta_reserva_meses`, `aporte_mensal_planejado`, `mes_foco` e, opcionalmente, `janela_meses` (padrão 8).

## 5. Como a Mel faz as contas

- **Gasto**: só o tipo `Gasto`. Pagamento de fatura e transferência entre suas contas não contam, para não duplicar. Compras no cartão contam na data da compra.
- **Custo de vida**: mediana (e média) dos gastos **recorrentes** (sem os extraordinários) nos últimos 8 meses fechados.
- **Renda do trabalho**: mediana de Salário V4 + Salário (estágio) + Freela nos 3 últimos meses fechados.
- **Dá pra guardar**: renda do trabalho − custo de vida médio − impostos médios.
- **Investimentos**: juros compostos a `pct_cdi × CDI`, com IR regressivo (22,5% → 15%). Não inclui IOF.
- **Simulador**: aplica os cortes por categoria sobre a média recorrente e projeta o patrimônio aplicando toda a sobra todo mês.

É uma ferramenta de organização, não recomendação de investimento.
