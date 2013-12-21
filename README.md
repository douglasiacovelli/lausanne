Lausanne
=====================

Repositório para meu projeto de **Iniciação Cientifica** financiado pela FAPESP cujo objetivo é o desenvolvimento de um protótipo de sistema para experimentos relacionados à **Linguagem Natural**.

Sou aluno do curso de Sistemas de Informação da Escola de Artes Ciências e Humanidades da Universidade de São Paulo (EACH-USP).

---------------------------
Aluno: Douglas Iacovelli<br>
Professor: Ivandre Paraboni

----------

Sobre o Sistema
--------
Foi criado utilizando o framework [Meteor](https://www.meteor.com/), baseado em Javascript e escolhido por proporcionar a experiência do tipo chat, cuja tela de um participante é alterada de acordo com a ação do outro.

Além disso, o sistema é **Responsivo** e pode ser utilizado em **computadores**, **tablets** ou **smartphones**.

O sistema foi desenvolvido para que 2 Participantes fizessem o experimento de modo **colaborativo**. Existe uma série de imagens que são exibidas aos participantes na mesma ordem e momento de forma que um deles seja responsável por descrever um objeto na imagem e o outro identificar qual objeto foi descrito.

Para isto, o **falante** irá visualizar uma imagem que conterá uma seta indicando o objeto a ser descrito:

<img src="http://i.imgur.com/QeHUiq3.png" style="width: 300px;"/>
<br>


----------


Por outro lado, o **ouvinte** visualizará uma outra versão da mesma imagem. Esta conterá letras que indicarão os possíveis objetos descritos:

<img src="http://i.imgur.com/YtrIhLe.png" style="width: 300px;"/>
<br>

Instalação
---------

Sistema de instalação utilizado: **Ubuntu 13.10**

- Instalar **Meteor**: `$ curl https://install.meteor.com | /bin/sh`

- Instalar pacote **npm**: `$ sudo apt-get install npm`

- Instalar **meteorite**: `$ sudo -H npm install -g meteorite`

Ter conta no Github com computador associado (chave pública)

Dar fork para criar um novo projeto com base no já feito ou apenas clonar o projeto atual https://github.com/douglasiacovelli/lausanne

- Para clonar: `$ git clone git@github.com:douglasiacovelli/lausanne.git`

Por conta de um erro na instalação do node, pode ser que seja necessário executar este comando:

- `$ sudo ln -s /usr/bin/nodejs /usr/bin/node`

- Entrar na pasta pelo terminal e digitar: `$ mrt`

Assim serão baixados os plugins para o correto funcionamento e será colocado em execução o sistema localmente.

> **NOTA:** O sistema poderá ser acessado na url: http://localhost:3000/

Deploy
------

O sistema pode ser utilizado online por meio do deploy fornecido no próprio servidor do meteor.

`$ meteor deploy nomeQueVocêDesejar.meteor.com`


----------

Informações Importantes
-----------------
- **Registros das respostas dos experimentos:** *URL*/experiments
    
- **Registros dos usuários participantes:** *URL*/users


>**Nota:** O sistema não foi pensado para ser seguro, por ser utilizado em ambiente controlado. Para isso deve-se estudar um pouco mais sobre isto no site do meteor removendo os pacotes insecure e autopublish, além de fazer as adaptações necessárias.


Alterações no Sistema
---------------------
    
É possível realizar algumas alterações no sistema para que se adeque às suas necessidades, como mudar as imagens a serem exibidas, se elas serão exibidas de forma invertida, se quando for cometido um erro a imagem irá para o fim da fila, as palavras proibidas etc. Para isto, é recomendado analisar o código nos pontos em que existem comentários e entender a estrutura principal.

Fluxograma e Funcionamento do Sistema
------------------------
![Fluxograma][1]
  [1]: http://i.imgur.com/1IPmMWz.jpg

  