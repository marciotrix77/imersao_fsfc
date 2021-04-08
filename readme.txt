1 - Levvantar os serviços do kafka:

    cd apache-kafka

    docker-compose up -d

2 - Levantar o simulador

    cd simulador

    docker-compose up -d

3 - Acessar e iniciar o serviço do container do simulador

    sudo docker exec -it simulator-codeedu

    go run main.go

4 - Acessar o container do kafka e rodar o processo do consumer

    sudo docker exec -it apache-kafka_kafka_1 bash

    kafka-console-consumer --bootstrap-server=localhost:9092 --topic=route.new-position --group=terminal

4 - Acessar o container do kafka e rodar o processo do producer

    sudo docker exec -it apache-kafka_kafka_1 bash

    kafka-console-producer --bootstrap-server=localhost:9092 --topic=route.new-direction

5 - Testar a execução:

    Ir no terminal do producer e digitar os seguintes strings:

    {"routeId":"1","clientId":"1"}
    {"routeId":"2","clientId":"2"}
    {"routeId":"2","clientId":"3"}

    OBS: Verificar a chagada da mensagem no terminal do simulador e depois verificar o envio das coordenadas do processo no consumidor


