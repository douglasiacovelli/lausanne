Experiments = new Meteor.Collection('experiments');
Problems = new Meteor.Collection('problems');
Usuarios = new Meteor.Collection('usuarios');
Sessions = new Meteor.Collection('sessions');
Tests = new Meteor.Collection('tests');
Answers = new Meteor.Collection('answers');
Descriptions = new Meteor.Collection('descriptions');




Router.map(function() { 
	
	/**
	 * Routing para a 1a pagina, onde eh realizado o cadastro
	 * do usuário
	 */
	
	this.route('home', {
		path: '/'
	});

	this.route('error', {
		path: '/error'
	});
	/**
	 * Routing para a 2a pagina - Posterior ao cadastro.
	 */
	
	this.route('start', {
		path: '/start'
	}, 
	function(){
		if(!Session.get('user_id')){
			Router.go('error');
		}else{
			this.render('start');
		}
	});

	this.route('start_experiment', {
		path: '/start_experiment/:user_type',
		data: function(){
			return {
				user_type: this.params.user_type,
				exp_id: Session.get('exp_id')
			}
		}
	}, 
	function(){
		if(!Session.get('user_id')){
			Router.go('error');
		}else{
			this.render('start_experiment');
		}
	});

	this.route('change_role', {
		path: '/change_role/:user_type',
		data: function(){
			var tipo_usuario;
			if(this.params.user_type == 'speaker'){
				tipo_usuario = 'Falante';
			}else{
				tipo_usuario = 'Ouvinte';
			}
			return {
				user_type: this.params.user_type,
				tipo_usuario: tipo_usuario
			}
		}
	}, 
	function(){
		if(!Session.get('user_id')){
			Router.go('error');
		}else{
			this.render('change_role');
		}
	});
	

	/**
	 * Routing para as pagina em que são exibidos todos os resultados dos experimentos.
	 */
	this.route('experiments', {
		path: '/experiments',
		data: function () {
			var experiments = Experiments.find().fetch();
			//console.log(experiments);
			for (x in experiments){
				var exp_id = experiments[x].id;

				var sessions = Sessions.find({exp_id: exp_id}).fetch();

				experiments[x].session = new Array(4);
				
				//Variavel relativa a cada experimento
				var answer_id = 1;


				for(y in sessions){
					
					/**
					 * Sao encontradas todas as respostas para aquela sessao e sao inseridas
					 * nestas respostas as informacoes a serem exibidas, visto que o ultimo
					 * laco itera sobre este elemento: answers (dentro de cada session (dentro de cada exp)).
					 */
					var answers = Answers.find({session_id: sessions[y]._id}).fetch();
					
					experiments[x].session[y] = answers;
					
					for(z in answers){

						experiments[x].session[y][z].answer_id = answer_id;
						
						if(experiments[x].session[y][z].isFlipped){
							experiments[x].session[y][z].img += 'r';
						}else{
							experiments[x].session[y][z].img += 'n';
						}
						

						if(answers[z].img.indexOf('practice') != -1){
							var index = answers[z].img.indexOf('practice');

							experiments[x].session[y][z].type = '-';
							experiments[x].session[y][z].cod_img = '-';
							experiments[x].session[y][z].mode = answers[z].img.substring(9,10);//9 indica a posição da letra depois da barra: "practice/a"
						}else{
							experiments[x].session[y][z].type = answers[z].img.substring(answers[z].img.length-1);
							experiments[x].session[y][z].cod_img = answers[z].img.substring(6,8);
							experiments[x].session[y][z].mode = answers[z].img.substring(8,9);
						}
						
						experiments[x].session[y][z].exp_id = exp_id;
						experiments[x].session[y][z].speaker_id = sessions[y].speaker_id;
						experiments[x].session[y][z].hearer_id = sessions[y].hearer_id;

						var timeToAnswer = parseInt(experiments[x].session[y][z].timeToAnswer);
						if(timeToAnswer > 60){
							var seconds = timeToAnswer % 60;
							var minutes = parseInt(timeToAnswer / 60);
							timeToAnswer = minutes+' m '+seconds+' s';
						}else{
							timeToAnswer = timeToAnswer + ' s'
						}

						experiments[x].session[y][z].timeToAnswer = timeToAnswer;

						var new_date = dateFormatted(experiments[x].session[y][z].created);
						experiments[x].session[y][z].created = new_date;
						
						answer_id++;
					}
				}
			};
			return {experiments: experiments}
		}
	});

	this.route('users', {
		path: '/users',
		data: function () {

			var usuarios = Usuarios.find().fetch();

			for(x in usuarios){
				usuarios[x].created = dateFormatted(usuarios[x].created);
			}

			return {usuarios: usuarios}
		}
	});

	/**
	 * Routing para as paginas de experimento de fato
	 */
	
	this.route('experiment', {
		path: '/experiment/:id/:user_type',
		controller: 'ExperimentController',
		action: 'user_type'

	});

	this.route('ending', {
		path: '/ending'
	});
});

function dateFormatted(timestamp){
	var date = new Date(timestamp * 1000);
	var day = date.getDate();
	var month = date.getMonth();
	var year = date.getFullYear();
	var hours = date.getHours();
	var minutes = date.getMinutes();

	minutes = minutes + '';
	day = day+'';
	month = month+'';
	hours = hours+'';

	if (minutes.length == 1){
		minutes = '0' + minutes;
	}
	if(hours.length == 1){
		hours = '0' + hours;
	}
	if(day.length == 1){
		day = '0' + day;
	}
	if(month.length == 1){
		month = '0' + month;
	}
	year = date.getFullYear()%2000;

	var new_date = day+'-'+month+'-'+year+' - '+hours+':'+minutes;
	return new_date;
}

ApplicationController = RouteController.extend({
	// layout: 'layout',
	loadingTemplate: 'loading'
	// notFoundTemplate: 'notFound'
});

ExperimentController = ApplicationController.extend({
	data: function(){

		var exp_id = this.params.id;

		var experiment = Experiments.findOne({id: exp_id});
		if(!experiment){
			Router.go('error');
			return;
		}

		Session.set('exp_id', exp_id);
		
		var description = Descriptions.findOne({session_id: Session.get('session_id')}, {sort: {created: -1}});

		return {
			'experiment': experiment,
			'description': description
		};
	},

	/**
	 * Isto eh uma action e ela eh chamada a partir do this.route('experiment').
	 * Esta action eh responsavel por identificar o tipo do usuário e renderizar
	 * o template correto para ele.
	 */
	
	user_type: function(){
		if(this.params.user_type == 'speaker'){
			this.render('speaker');
		}else{
			this.render('hearer');
			
		}

		
		Session.set('user_type', this.params.user_type);
		
	}

});

if (Meteor.isClient) {

	Meteor.startup(function() {
		// so you can know if you've successfully in-browser browsed
		console.log('Started at ' + location.href);
	});

	/**
	 * Declaração das variaveis a serem utilizadas por cada client
	 */

	Session.setDefault('exp_id', null);
	Session.setDefault('session_id', null);
	Session.setDefault('user_id', null);
	Session.setDefault('wrong_input', false);
	Session.setDefault('tests_queue', false);
	Session.setDefault('problem_id', null);
	Session.setDefault('user_type', null);
	Session.setDefault('isPractice', null);

	Template.home.wrong_input = function(){
		if(Session.get('wrong_input') == true){
			return true;
		}else{
			return false;
		}
	}

	Template.hearer.wrong_input = function(){
		if(Session.get('wrong_input') == true){
			return true;
		}else{
			return false;
		}
	}

	/**
	 * Pega os eventos que acontecerem no template home.
	 * Para este caso apenas o envio do form de novo usuario
	 */

	Template.home.events({

		'submit #add-user' : function() {
			var name = document.getElementById('name').value;

			var age = document.getElementById('age').value;
			age = parseInt(age);

			var gender = document.getElementById('gender');
			var gender = gender.options[gender.selectedIndex].value;

			var handwriting = document.getElementById('handwriting');
			var handwriting = handwriting.options[handwriting.selectedIndex].value;

			var user = Usuarios.findOne({}, {sort: {created: -1}});
			var user_id;

			if(user){
				user_id = user.id;
				user_id++;
			}else{
				user_id = 1;
			}

			user_id = new Date().getTime().toString();

			Usuarios.insert({id: user_id, name: name, age: age, gender: gender, handwriting: handwriting , created: Date.now()/1000});
			Session.set('user_id', user_id);
			
			console.log('ok');

			Session.set('wrong_input', false);
			Router.go('start');

		}
	});

	

	Template.start.wrong_input = function(){
		if(Session.get('wrong_input') == true){
			return true;
		}else{
			return false;
		}
	}

	/**
	 * CRIACAO DO EXPERIMENTO
	 * 
	 * Este metodo eh executado assim que no template home for clicado
	 * o botão de id "create". Ele buscara o último registro para que
	 * seja feita uma implementacao do autoincrement no id. Este id
	 * foi criado para facilitar a comunicacao entre os participantes
	 * do experimento. Alem disso, eh criada uma nova entrada de experimento.
	 */

	Template.start.events({

		'click #create' : function() {
			createExperiment(false);
			
		},

		'submit #enter' : function() {
			 var exp_id = document.getElementById('enter-input').value;
			 if(exp_id){
				
				// Faz a conversão do input para número e redireciona a pessoa para a página do experimento
				// wrong_input serve para o template saber se deve adicionar ou não a msg de erro (experimento inválido)
				
				// To-Do: Deve-se verificar se o experimento existe e é válido. Se for, ok.

				var experiment = Experiments.findOne({id: exp_id});
				if(!experiment){
					Session.set('wrong_input', true);
					return;
				}
				
				var session = Sessions.findOne({exp_id: exp_id}, {sort: {created: 1}}); //Pega a primeira session criada

				Sessions.update(session._id, {$set: {hearer_id:  Session.get('user_id')}});

				Router.go('experiment', {id: exp_id, user_type: 'hearer'});
				Session.set('wrong_input', false);

				var session = Sessions.findOne({exp_id: exp_id}, {sort: {created: -1}});
				Session.set('session_id', session._id);
				
				
				// TO-DO: verificar se experimento existe no banco e se está ativo
			}else{
				Session.set('wrong_input', true);	
			}
			
			
		 }
	});
	

	Template.speaker.events({
		'submit #submitDescription' : function() {
			messageInput = document.getElementById('message').value;
			messageInput += '';
			//console.log(this.params);
			var denied_words = ["meio", "centro", "central", 'cena', "área", "area", "zona", "região", "regiao", "canto", "inferior", "superior", "norte", "sul", "leste", "oeste", "nordeste", "noroeste", "sudeste", "sudoeste", "tela", "imagem", "figura", "coluna", "linha", "fileira", "posição", "posicao", "primeiro", "primeira", "segundo", "segunda", "terceiro", "terceira", "quarto", "quarta", "quinto", "quinta"]

			for (var i = 0; i < denied_words.length; i++) {
				var denied = false;
				var index = messageInput.indexOf(denied_words[i]);

				if(index != -1){
					
					var indexBeforeWord = index-1;
					var indexAfterWord = index + denied_words[i].length;

					if(indexBeforeWord >= 0){
						
						
						if(messageInput.charAt(indexBeforeWord) == ' '){
							if(indexAfterWord < messageInput.length){
								if(messageInput.charAt(indexAfterWord) == ' '){

									//"blblal linha balblaba"
									denied = true;
								}
							}else{
								//"blablal linha"
								denied = true;
							}
						}
					}else{
						if(indexAfterWord < messageInput.length){
							if(messageInput.charAt(indexAfterWord) == ' '){

								//"linha balblaba"
								denied = true;
							}
						}else{
							//"linha"
							denied = true;
						}
						
					}
					
					if(denied){
						alert("Por favor tente de novo sem usar palavras como \""+denied_words[i]+"\"");
						return;
					}
				}
			}
			
			var words = ["esquerda", "direita", "acima", "em cima", "abaixo", "embaixo", "baixo"];

			var allowed_sentences = ["esquerda d", "direita d", "acima d", "em cima d", "abaixo d", "embaixo d", "baixo d"];
			
			//Se neste for ele encontrar uma das palavras como (esquerda, direita), então ele deve verificar se essa palavra
			//tem um d* na frente com o for de dentro
			for (var i = 0; i < words.length; i++) {
				if(messageInput.indexOf(words[i]) != -1){

					var expression_found = false;
					for (var j = 0; j < allowed_sentences.length; j++) {

						if(messageInput.indexOf(allowed_sentences[j]) != -1){
							expression_found = true;
							console.log(allowed_sentences[j]);
						}
					}
					if(!expression_found){
						alert("Você não deve usar \""+words[i]+"\" isoladamente. Tente de novo, dizendo \""+words[i]+"\" de qual objeto você se refere ");
						return;
					}
				}
			
			};
			

			Descriptions.insert({ session_id: Session.get('session_id'), message: messageInput, created: Date.now()/1000 });

			document.getElementById('message').value = '';
			console.log('input limpo');
		}
	});

	Template.hearer.events({
		'submit #submitAnswer' : function() {
			$('button[name="rating"].active').val();
			var answer = document.getElementById('answer').getElementsByClassName('active');
			if(answer[0]){
				answer = answer[0].innerHTML;
				Session.set('wrong_input', false);
			}else{
				console.log('invalido');
				Session.set('wrong_input', true);
				return false;
			}
			

			var description = Descriptions.findOne({session_id: Session.get('session_id')}, {sort: {created: -1}});
			var problem = Problems.findOne(Session.get('problem_id'));

			var img = problem.img;
			
			if(img.indexOf('practice') == -1){
				img = img.substring(6,12);
			}
			console.log(img);

			var test = Tests.findOne({img: img});
			console.log(test);

			var isCorrect = false;

			if(test.correct_answer == answer){
				isCorrect = true;

				Problems.update(Session.get('problem_id'), {$set: {isActive: false}});

			}else{
				if(answer == 'Não Entendi'){

				}else{
					Problems.update(Session.get('problem_id'), {$set: {created: Date.now()/1000}}); //atualiza seu created para que ele fique maior que todos e vá para o fim da fila
					console.log('Fim da fila problem '+Session.get('problem_id'));	
				}
				
			}
			var isFlipped = false;
			if(problem.isFlipped != ''){
				isFlipped = true;
			}
			var description = Descriptions.findOne({ session_id: Session.get('session_id')},{sort: {created: -1}});
			var now = Date.now()/1000;
			var timeToAnswer = now - description.created;

			var answer = Answers.insert({ session_id: Session.get('session_id'), description: description.message, answer: answer, isCorrect: isCorrect, isFlipped: isFlipped, img: problem.img, timeToAnswer: timeToAnswer, created: Date.now()/1000 });
			//Verificar se resposta dada foi correta
		}
	});


	Template.start_experiment.events({
		'click #start_experiment_button': function() {
			if(Session.get('isPractice')){
				Session.set('isPractice', false);
				var experiment = Experiments.findOne({id: Session.get('exp_id')});

				Experiments.update(experiment._id, {$set: {isPractice:  false}});	
			}
			console.log('va');
			Router.go('experiment', {id: Session.get('exp_id'), user_type: Session.get('user_type')});
		}
	});

	Template.change_role.events({
		'click #change_role_button': function() {
			var link = document.getElementById('change_role_button')

			var user_type = link.getAttribute("data-target")
			Router.go('experiment', {id: Session.get('exp_id'), user_type: user_type});
		}
	});
	
	Template.hearer.waiting = function(){
		return amIwaiting('hearer', Session.get('session_id'));
	}

	Template.speaker.waiting = function(){
		return amIwaiting('speaker', Session.get('session_id'));
	}

	Template.speaker.type = function(){
		if(Session.get('isPractice')){
			return 'Prática';
		}else{
			return 'Experimento';	
		}
		
	}

	Template.hearer.type = function(){

		if(Session.get('isPractice')){
			return 'Prática';
		}else{
			return 'Experimento';	
		}
		
	}

	

	Template.speaker.problem = function(){
		var problem = actualProblem(Session.get('session_id'), 'speaker');
		if(problem){
			return problem;
		}else{
			/**
			 * Verificar se pode ser criada mais uma sessão. Se puder, cria e muda os papeis.
			 * Caso não possa, redirecione para o fim do experimento.
			 */
			
			var session = Sessions.findOne({exp_id: Session.get('exp_id'), id: 2});
			if(!session){
				
				var new_session = Sessions.insert({exp_id: Session.get('exp_id'), id: 2, created: Date.now()/1000, speaker_id: null, hearer_id: Session.get('user_id'), experiment_finished: false });
				var exp = Experiments.findOne({id: Session.get('exp_id')});
				
				Experiments.update(exp._id, {$set: {isPractice:  true}});	

				Session.set('session_id', new_session);

				
				prepareSessionProblems(Session.get('exp_id'), conditions, types, flipped);
				
				//Router.go('experiment', {id: Session.get('exp_id'), user_type: 'hearer'});
				Router.go('change_role', {user_type: 'hearer'});

			}else{

				var exp = Experiments.findOne({id: Session.get('exp_id')});
			
				Router.go('ending');
			
				
			}

		}
	};

	Template.hearer.problem = function(){
		

		var problem = actualProblem(Session.get('session_id'), 'hearer');
		if(problem){
			return problem;
		}else{
			/**
			 * Verifica se ja existe a segunda sessao. Caso exista,
			 * ele deve verificar se já foi preenchido o speaker_id,
			 * isto indica se ja foi iniciada a segunda sessao.
			 *
			 * Se existir speaker_id, então eh a primeira vez que a funcao
			 * esta passando e setando a variavel Session.set(session_id).
			 * Caso contrario, entao pode-se dizer que chgou ao fim do experimento
			 */
			var session = Sessions.findOne({exp_id: Session.get('exp_id'), id: 2});
			if(session){
				setTimeout(function(){
					if(session.speaker_id == null){

					
						Sessions.update(session._id, {$set: {speaker_id:  Session.get('user_id')}});
						Session.set('session_id', session._id);

						Router.go('change_role', {user_type: 'speaker'});
						//Router.go('experiment', {id: Session.get('exp_id'), user_type: 'speaker'});
						console.log('Delay');
					

					}else{
						
						var exp = Experiments.findOne({id: Session.get('exp_id')});
						Router.go('ending');
					};

				},500);
				
			}

		}
	};


	function amIwaiting(user,session_id){
		var description = Descriptions.findOne({session_id: session_id}, {sort: {created: -1}});
		var answer = Answers.findOne({session_id: session_id},  {sort: {created: -1}});
		console.log(user);

		if(user == 'hearer'){

			if(description && !answer){
				return false;
			}else{
				if(!description){
					return true;
				}

				if(answer.created > description.created){
					return true;
				}else{
					return false;
				}
			}
			
		}else{
			if(description && !answer){
				return true;
			}else{
				if(!description){
					return false;
				}

				if(answer.created > description.created){
					console.log(answer.answer);
					if(answer.answer == 'Não Entendi'){
						alert('Atenção! O ouvinte não entendeu. Tente ser mais claro, por favor :)');
					}
					return false;
				}else{
					return true;
				}
				return false;
			}
		}
	};


	function actualProblem(session_id, user_type){
		var experiment = Experiments.findOne({id: Session.get('exp_id')});

		Session.set('isPractice', experiment.isPractice);

		var problem;
		if(Session.get('isPractice')){
			problem = Problems.findOne({session_id: session_id, isActive: true, isPractice: true}, {sort: {created: 1}});

			if(problem == null){ //Fim dos problemas de pratica
					
				
				
				console.log('Indo para start_experiment');
				Router.go('start_experiment', {user_type: user_type});
			}else{
				Session.set('problem_id', problem._id);
				return problem;
			}
		}
		
		problem = Problems.findOne({session_id: session_id, isActive: true,  isPractice: false}, {sort: {created: 1}});
		
		if(problem){
			Session.set('problem_id', problem._id);
		}else{
			return null;
		}
		

		return problem;
	}

	//Declarando os arrays que serão utilizados para selecionar as imagens
	var conditions = ['01f', '01o', '02f', '02o', '03f', '03o', '04f', '04o', '05f', '05o', '06f', '06o', '07f', '07o', '08f', '08o'];
	var types = ['1','1','1','1','1','1','1','1','2','2','2','2','2','2','2','2'];
	var flipped = ['','','','','','','','','flip-horizontal','flip-horizontal','flip-horizontal','flip-horizontal','flip-horizontal','flip-horizontal','flip-horizontal','flip-horizontal'];

	function prepareSessionProblems(exp_id, conditions, types, flipped){
		var conditions = shuffleArray(conditions);
		var types = shuffleArray(types);
		var flipped = shuffleArray(flipped);

	

		var session = Sessions.findOne({exp_id: exp_id}, {sort: {created: -1}});
		var img1 = 'practice/a';
		var img2 = 'practice/b';
		var img3 = 'practice/c';
		var img4 = 'practice/d';

		Problems.insert({session_id: session._id, img: img1, isFlipped: flipped[5], isActive: true, isPractice: true, created: Date.now()/1000});
		Problems.insert({session_id: session._id, img: img2, isFlipped: flipped[8], isActive: true, isPractice: true, created: Date.now()/1000});
		Problems.insert({session_id: session._id, img: img3, isFlipped: flipped[2], isActive: true, isPractice: true, created: Date.now()/1000});
		Problems.insert({session_id: session._id, img: img4, isFlipped: flipped[11], isActive: true, isPractice: true, created: Date.now()/1000});

		
		for (var i = 0; i < 16; i++) {//Change 3 to 16
			var img = 'type'+types[i]+'/'+conditions[i]+'-t'+types[i];
			Problems.insert({session_id: session._id, img: img, isFlipped: flipped[i], isActive: true, isPractice: false, created: Date.now()/1000});
		};
	}

	function randomLetter(){
		var alpha = ['A','B','C','D','E','F','G','H','J','K','L','M','N','P','Q','R','S','T','U','V','W','X','Y','Z'];
		var rand = alpha[Math.floor(Math.random() * alpha.length)];
		return rand;
	}

	/**
	 * Randomize array element order in-place.
	 * Using Fisher-Yates shuffle algorithm.
	 */
	function shuffleArray(array) {
		for (var i = array.length - 1; i > 0; i--) {
			var j = Math.floor(Math.random() * (i + 1));
			var temp = array[i];
			array[i] = array[j];
			array[j] = temp;
		}
		return array;
	}

	function createExperiment(isPractice){
		var exp = Experiments.findOne({}, {sort: {created: -1}});
		
		var letter1 = randomLetter();
		var letter2 = randomLetter();

		
		var exp_id;

		if(exp){
			exp_id = exp.id.substring(1,exp.id.length-1);
			
			exp_id++;
			exp_id = letter1+exp_id+letter2;
			console.log(exp_id);
		}else{
			exp_id = letter1+1+letter2;
		}

		Session.set('isPractice', true);
		
		/**
		 * Todo experimento começa como isPractice: true, para que ambos usuários saibam que estão
		 * praticando. Posteriormente ao fim dos practices, então é atualizada esta tupla,
		 * alterando o isPractice para false.
		 */

		Experiments.insert({ id: exp_id, isPractice: true, created: Date.now()/1000});		
		var session;

		session = Sessions.insert({exp_id: exp_id, id: 1, created: Date.now()/1000, speaker_id: Session.get('user_id'), hearer_id: null });
		Session.set('session_id', session);
		

		prepareSessionProblems(exp_id, conditions, types, flipped);
		
		Router.go('experiment', {id: exp_id, user_type: 'speaker'});
		
	}


}

if (Meteor.isServer) {

	Meteor.startup(function () {
		Tests.insert({img: '01f-t1' ,type: 1, condition: '01f', correct_answer: 'H'});
		Tests.insert({img: '01o-t1' ,type: 1, condition: '01o', correct_answer: 'H'});
		Tests.insert({img: '02f-t1' ,type: 1, condition: '02f', correct_answer: 'O'});
		Tests.insert({img: '02o-t1' ,type: 1, condition: '02o', correct_answer: 'O'});
		Tests.insert({img: '03f-t1' ,type: 1, condition: '03f', correct_answer: 'M'});
		Tests.insert({img: '03o-t1' ,type: 1, condition: '03o', correct_answer: 'M'});
		Tests.insert({img: '04f-t1' ,type: 1, condition: '04f', correct_answer: 'A'});
		Tests.insert({img: '04o-t1' ,type: 1, condition: '04o', correct_answer: 'A'});
		Tests.insert({img: '05f-t1' ,type: 1, condition: '05f', correct_answer: 'M'});
		Tests.insert({img: '05o-t1' ,type: 1, condition: '05o', correct_answer: 'M'});
		Tests.insert({img: '06f-t1' ,type: 1, condition: '06f', correct_answer: 'H'});
		Tests.insert({img: '06o-t1' ,type: 1, condition: '06o', correct_answer: 'H'});
		Tests.insert({img: '07f-t1' ,type: 1, condition: '07f', correct_answer: 'I'});
		Tests.insert({img: '07o-t1' ,type: 1, condition: '07o', correct_answer: 'I'});
		Tests.insert({img: '08f-t1' ,type: 1, condition: '08f', correct_answer: 'A'});
		Tests.insert({img: '08o-t1' ,type: 1, condition: '08o', correct_answer: 'A'});
		Tests.insert({img: '01f-t2' ,type: 2, condition: '01f', correct_answer: 'H'});
		Tests.insert({img: '01o-t2' ,type: 2, condition: '01o', correct_answer: 'H'});
		Tests.insert({img: '02f-t2' ,type: 2, condition: '02f', correct_answer: 'O'});
		Tests.insert({img: '02o-t2' ,type: 2, condition: '02o', correct_answer: 'O'});
		Tests.insert({img: '03f-t2' ,type: 2, condition: '03f', correct_answer: 'M'});
		Tests.insert({img: '03o-t2' ,type: 2, condition: '03o', correct_answer: 'M'});
		Tests.insert({img: '04f-t2' ,type: 2, condition: '04f', correct_answer: 'A'});
		Tests.insert({img: '04o-t2' ,type: 2, condition: '04o', correct_answer: 'A'});
		Tests.insert({img: '05f-t2' ,type: 2, condition: '05f', correct_answer: 'M'});
		Tests.insert({img: '05o-t2' ,type: 2, condition: '05o', correct_answer: 'M'});
		Tests.insert({img: '06f-t2' ,type: 2, condition: '06f', correct_answer: 'H'});
		Tests.insert({img: '06o-t2' ,type: 2, condition: '06o', correct_answer: 'H'});
		Tests.insert({img: '07f-t2' ,type: 2, condition: '07f', correct_answer: 'I'});
		Tests.insert({img: '07o-t2' ,type: 2, condition: '07o', correct_answer: 'I'});
		Tests.insert({img: '08f-t2' ,type: 2, condition: '08f', correct_answer: 'A'});
		Tests.insert({img: '08o-t2' ,type: 2, condition: '08o', correct_answer: 'A'});

		Tests.insert({img: 'practice/a', correct_answer: 'H'});
		Tests.insert({img: 'practice/b', correct_answer: 'A'});
		Tests.insert({img: 'practice/c', correct_answer: 'M'});
		Tests.insert({img: 'practice/d', correct_answer: 'I'});

		console.log('tests created');
	});
	
	
}

