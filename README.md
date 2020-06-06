# Lop-back-end

Sem bem vindo a um dos repositórios do projeto LOP - Lógica de Programação, aqui você encontrará os arquivos referentes ao backend do sistema.

## Ambiente de Desenvolvimento

Deseja contribuir para o o projeto? Abaixo organizaremos um passo a passo para você que esta começando agora conseguir montar seu ambiente de trabalho com o nosso sistema funcionando localmente.

Para a correta configuração do ambiente de desenvolvimento do projeto lop-back-end, você precisa instalar:

* git
* node
* npm
* yarn
* mysql 


Considerando que você esta utilizando o sistema operacional linux(utilizamos ubuntu para o exemplo a seguir), siga os seguintes passos:

### Instalação dos software necessários

1. Instalação do git

```
sudo apt update

sudo apt install git

```
2. Instalação do node

``` 

sudo apt install nodejs

``` 
### 3. Instalação do npm
``` 

sudo apt install npm

``` 

### 4. Instalação do yarn
``` 

sudo npm install yarn –g

``` 

### 5. Instalação do mysql

[Tutorial instalação mysql](https://www.digitalocean.com/community/tutorials/como-instalar-o-mysql-no-ubuntu-18-04-pt).


### Baixar o projeto - clonar repositório

Como você ja instalou o git agora  baixe o projeto ataves do git clone

```
git clone https://github.com/Natalnet/lop-back-end.git

```
Essse comando criará uma pasta com o projeto ( pasta: lop-back-end )

### Criar usuário e banco de dados no mysql 


Logaremos no mysql com o usuário root e criaremos o usuário xxx

```
mysql -u root -p

GRANT ALL PRIVILEGES ON *.* TO 'xxx'@'localhost' IDENTIFIED BY 'xxxx';

```

Saia do mysql. 

E entre novamente, dessa vez utilizando o usuario criado: xxx
Dessa vez, iremos criar o banco de dados xxxx

```
mysql -u xxx -p
CREATE DATABASE xxxx;

``` 

### Executar o servidor

Entre na pasta do projeto, pasta criada ao executar o comando git clone no passo anterior.

```
cd lop-back-end

yarn install

yarn start
```

Pronto, você deve ver o servidor em execução
```
root@DESKTOP-F5QS19P:/home/aquiles/nodeProjects/lop-back-end# yarn start
yarn run v1.22.4
$ node src/index.js
Ativo em localhost:3001
conexão com o banco de dados realizada com sucesso!
```
