# language: pt
@smoke @api @regression
Funcionalidade: Autenticacao
  Como um usuario do sistema
  Desejo autenticar na API
  Para acessar recursos protegidos

  @api
  Cenario: Tentar login com credenciais invalidas
    DADO que o servidor esta em execucao
    QUANDO eu enviar uma requisicao POST para "/api/v1/auth/login" com o corpo:
      """
      {
        "email": "naoexiste@teste.com",
        "senha": "senhaerrada"
      }
      """
    ENTAO o codigo de resposta deve ser 401

  @api
  Cenario: Tentar acessar rota protegida sem token
    DADO que o servidor esta em execucao
    QUANDO eu enviar uma requisicao GET para "/api/v1/auth/me"
    ENTAO o codigo de resposta deve ser 401
