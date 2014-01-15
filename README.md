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

- Instalar pacote **npm**: `$ sudo apt-get install npm`

- Instalar **meteorite**: `$ sudo -H npm install -g meteorite`

Ter conta no Github com computador associado (chave pública)

Dar fork para criar um novo projeto com base no já feito ou apenas clonar o projeto atual https://github.com/douglasiacovelli/lausanne

- Para clonar: `$ git clone git@github.com:douglasiacovelli/lausanne.git`

Por conta de um erro na instalação do node, pode ser que seja necessário executar este comando:

- `$ sudo ln -s /usr/bin/nodejs /usr/bin/node`

- Entrar na pasta pelo terminal e digitar: `$ mrt`

Assim, serão baixados os plugins necessários e o sistema começará a rodar localmente.

> **NOTA:** O sistema poderá ser acessado na url: http://localhost:3000/

Deploy
------

O sistema pode ser utilizado online por meio do deploy fornecido no próprio servidor do meteor.

`$ meteor deploy nomeDoSeuApp.meteor.com`


----------

Manutenção da base coletada
====
Para visualizar:
---

- **os registros das respostas dos experimentos:** *URL*/experiments
    
- **os registros dos usuários participantes:** *URL*/users

---
Para limpar a base:
----

 - **continuando a sequência de ids** de experimento e usuários: *URL*/clearDB/*password que você definir na linha 10*
 <br>
 - de forma a **reiniciar o sistema inteiro**, pelo terminal:
 <br>
     - `$ meteor deploy nomeDoSeuApp.meteor.com --delete`
     - `$ meteor deploy nomeDoSeuApp.meteor.com`

<br>
>**Nota:** O sistema não foi pensado para ser seguro, por ser utilizado em ambiente controlado. [Material adicional sobre segurança no meteor.][1]


Alterações no Sistema
=====================
Alterando as possíveis opções de resposta do ouvinte
-------------------
Deve-se **alterar** o array options, substituindo os os valores atuais pelas opções desejadas:
```javascript
Template.hearer.options = function(){
    var options = ['A','H','I','M','O','Não Entendi'];
    return options;
};
```

Alterando as imagens da base
-------------------
É importante que as imagens a serem inseridas possuam o nome no seguinte formato para se facilitar a adaptação:

>condicao-tX.png

>tX corresponde ao tipo de imagem, podendo assumir valores como: t1, t2,..., tn

**Exemplos:**
img1-t1.png
img1-t2.png
img2-t1.png

Mesmo que haja somente um tipo de imagem, sua utilização é obrigatória.
<br>

**Trechos no código também deverão ser adaptados:**

 - Primeiro termo do nome: `var conditions = ['img1','img2',...];`
 - Segundo termo do nome: `var types = ['1','1','1',...];`


>**Exemplo 1**
Serão inseridas 14 imagens e todas elas são do tipo 1 e serão exibidas. Então o array types deverá conter 14 posições preenchidas com o string '1'. 
<br>

>**Exemplo 2**
Serão inseridas 16 imagens (condições diferentes) com 2 tipos diferentes e apenas 16 imagens serão exibidas. Então o array conditions terá todas as 16 possibilidades de condições diferentes que serão combinadas com os tipos 1 ou 2.
<br>
Então para que se mantenha o mesmo número de imagens de tipo 1 e 2, deve-se preencher o array **types** inserindo **8 posições '1'** e **8 posições '2'**.

<br>
>Estas exigências são necessárias para que o método `prepareSessionProblems`consiga construir os nomes dos testes que serão criados, permitindo criar combinações de tipos com condições diferentes de maneira uniforme, garantindo que metade dos tipos sempre seja 1 e outra metade 2, como mostrado no segundo exemplo.

<br>
**Sobre o array flipped**
>Caso seja de interesse, ele pode ser mantido, devendo apenas preenchê-lo com o número de imagens que serão exibidas. Caso não seja necessário, então basta preenchê-lo com strings vazias:
<br>
>**Exemplo**
Serão exibidas 6 imagens e metade delas deve ser exibida de maneira invertida:
`var flipped = ['','','','flip-horizontal','flip-horizontal','flip-horizontal'];`
<br>

----
As imagens devem ser inseridas dentro da pasta public/img dentro da pasta hearer ou speaker e dentro de seu respectivo tipo *(caso seja apenas 1, dentro do type1)*. É importante que as figuras possuam o mesmo nome, para que o sistema consiga exibir de forma sincronizada aos dois usuários.

Caso o seu experimento possua imagens de apenas um tipo, você deverá inseri-las na pasta type1, excluindo a segunda pasta. Caso contrário poderá utilizá-las normalmente.

Inseridas as imagens e alterados os trechos de código citados inicialmente, deve-se alterar a última seção do código, onde são inseridos os Tests

**Exemplo:**
>Inserindo a imagem **img1-t1.png** na pasta *hearer/type1* e sua versão alternativa de mesmo nome (**img1-t1.png**) na pasta *speaker/type1*.

Atualizando o código na seção de Tests:

`Tests.insert({img: 'img1', type: 1, condition: 'img1', correct_answer: 'H'});`

Nota Importante
----------

 - **É importante notar que devem ser inseridos tantos números quantas forem as imagens a serem exibidas e os 3 arrays (conditions, types e flipped) devem possuir o mesmo tamanho.**

 - **O método shuffleArray(array) pode ser removido. Neste caso, prevalecerá a ordem inserida nos arrays conditions, types e flipped.**
 - **O formato da imagem deve ser sempre o mesmo. Recomenda-se png, mas se desejado, é possível alterar no arquivo html onde ocorre `}}.png`**

Outras modificações
-------------------

    
É possível realizar outras alterações no sistema para que se adeque às suas necessidades, como se quando for cometido um erro a imagem irá para o fim da fila, as palavras proibidas etc. Para isto, é recomendado analisar o código nos pontos em que existem comentários e entender a estrutura principal.


Fluxograma e Funcionamento do Sistema
------------------------
O Sistema é baseado em Experiments. Cada Experiment possui uma Session e cada Session possui dois usuários associados, sendo um o hearer e outro o speaker. <br>

São gerados então os Problems, que correspondem aos problemas destinados àqueles participantes.
<br>

Inicialmente são armazenadas as descriptions, que armazenam apenas a descrição feita pelo speaker associada à uma session. Por meio de checagem de timestamps, é verificada qual foi a última entrada no banco relacionada à session dos usuários atuais e dependendo do resultado o controle é trocado. Sendo a "vez" de o outro participante agir.
<br>

Então o usuário hearer escolhe a alternativa que ele julga ser correta e é criada uma tupla de Answer, que conterá as informações da Description feita pelo speaker com a resposta do hearer. Por fim, a resposta é comparada com a tabela de Tests criada inicialmente com todas as respostas para os problemas. A tupla é atualizada com o resultado da resposta. 
<br>

Ao fim da primeira rodada, os papeis são invertidos. É criada uma nova session em que o antigo speaker torna-se o hearer e vice-versa.


![Fluxograma][2]
  


  [1]: http://docs.meteor.com/#dataandsecurity
  [2]: http://i.imgur.com/1IPmMWz.jpg