# language: pt
@api @regression
Funcionalidade: Gestao de Orgaos
  Como um administrador do sistema
  Desejo gerenciar orgaos (tenants)
  Para administrar as entidades do ERP

  @api
  Cenario: Listar orgaos sem autenticacao
    DADO que o servidor esta em execucao
    QUANDO eu enviar uma requisicao GET para "/api/v1/core/orgaos"
    ENTAO o codigo de resposta deve ser 200
    ENTAO o corpo da resposta deve ser um array

  @api
  Cenario: Criar orgao com dados validos
    DADO que o servidor esta em execucao
    QUANDO eu enviar uma requisicao POST para "/api/v1/core/orgaos" com o corpo:
      """
      {
        "cnpj": "11222333000181",
        "razao_social": "Orgao Teste Ltda",
        "nome_fantasia": "Orgao Teste",
        "esfera": "municipal"
      }
      """
    ENTAO o codigo de resposta deve ser 201
    ENTAO o corpo da resposta deve conter "id"
    ENTAO o corpo da resposta deve conter "razao_social" igual a "Orgao Teste Ltda"

  @api
  Cenario: Criar orgao com CNPJ invalido
    DADO que o servidor esta em execucao
    QUANDO eu enviar uma requisicao POST para "/api/v1/core/orgaos" com o corpo:
      """
      {
        "cnpj": "00000000000000",
        "razao_social": "Orgao Invalido",
        "esfera": "municipal"
      }
      """
    ENTAO o codigo de resposta deve ser 400

  @api
  Cenario: Buscar orgao por ID inexistente
    DADO que o servidor esta em execucao
    QUANDO eu enviar uma requisicao GET para "/api/v1/core/orgaos/00000000-0000-0000-0000-000000000000"
    ENTAO o codigo de resposta deve ser 404
