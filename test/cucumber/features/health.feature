# language: pt
@smoke @api @regression
Funcionalidade: Health Check
  Como um consumidor da API
  Desejo verificar a saude do servidor
  Para garantir que o servico esta operacional

  Cenario: Verificar health check do servidor
    DADO que o servidor esta em execucao
    QUANDO eu enviar uma requisicao GET para "/api/v1/health"
    ENTAO o codigo de resposta deve ser 200
    ENTAO o corpo da resposta deve conter "status" igual a "ok"
    ENTAO o corpo da resposta deve conter "timestamp"
    ENTAO o corpo da resposta deve conter "uptime"
