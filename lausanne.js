Experiments = new Meteor.Collection('experiments');
Problems = new Meteor.Collection('problems');
Usuarios = new Meteor.Collection('usuarios');
Sessions = new Meteor.Collection('sessions');
Tests = new Meteor.Collection('tests');
Answers = new Meteor.Collection('answers');
Descriptions = new Meteor.Collection('descriptions');
Practices = new Meteor.Collection('practices');




Router.map(function() { 
	
	/**
	 * Routing para a 1a pagina, onde eh realizado o cadastro
	 * do usuário
	 */
	
	this.route('home', {
		path: '/'
	});

	/**
	 * Routing para a 2a pagina - Posterior ao cadastro.
	 */
	
	this.route('start', {
		path: '/start'
	});

	/**
	 * Routing para as pagina em que são exibidos todos os experimentos criados
	 */
	this.route('experiments', {
		path: '/experiments',
		data: function () {
			return {experiments: Experiments.find()}
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

	this.route('start_experiment', {
		path: '/start_experiment/:user_type',
		data: function() { return this.params.user_type; }
	});
	
});

ApplicationController = RouteController.extend({
	// layout: 'layout',
	loadingTemplate: 'loading'
	// notFoundTemplate: 'notFound'
});

ExperimentController = ApplicationController.extend({
	data: function(){

		var exp_id = this.params.id;

		Session.set('exp_id', exp_id);
		

		var result_experiments = Experiments.findOne({id: exp_id});

		var description = Descriptions.findOne({session_id: Session.get('session_id')}, {sort: {created: -1}});

		return {
			'experiment': result_experiments,
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
			var age = document.getElementById('age').value;
			age = parseInt(age);

			var gender = document.getElementById('gender');
			var gender = gender.options[gender.selectedIndex].value;

			var handwriting = document.getElementById('handwriting');
			var handwriting = handwriting.options[handwriting.selectedIndex].value;

			var user_id = Usuarios.insert({ age: age, gender: gender, handwriting: handwriting , created: Date.now()});
			Session.set('user_id', user_id);

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

	Template.start_experiment.events({

		'click #start_experiment' : function() {
			
			var user_type = this+'';
			Router.go('experiment', {id: Session.get('exp_id'), user_type: user_type});
		}
	});

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
			var exp_id = Experiments.findOne({}, {sort: {created: -1}});
			
			var letter1 = randomLetter();
			var letter2 = randomLetter();

			if(exp_id){
				exp_id = exp_id.id.charAt(1);
				exp_id++;
				exp_id = letter1+exp_id+letter2;
				console.log(exp_id);
			}else{
				exp_id = letter1+1+letter2;
			}


			Experiments.insert({ id: exp_id, created: Date.now()/1000});
			
			// Criacao da Session e set da variavel Session('session_id')
			var session = Sessions.insert({exp_id: exp_id, id: 1, created: Date.now()/1000, speaker_id: Session.get('user_id'), hearer_id: null });
			Session.set('session_id', session);

			prepareSessionPractices(exp_id, conditions, types, flipped);
			
			//prepareSessionProblems(exp_id, conditions, types, flipped);
			
			Router.go('experiment', {id: exp_id, user_type: 'speaker'});
			
		},

		'submit #enter' : function() {
			var exp_id = document.getElementById('enter-input').value;
			if(exp_id){
				
				// Faz a conversão do input para número e redireciona a pessoa para a página do experimento
				// wrong_input serve para o template saber se deve adicionar ou não a msg de erro (experimento inválido)
				
				// To-Do: Deve-se verificar se o experimento existe e é válido. Se for, ok.

				exp_id = exp_id;
				
				var session = Sessions.findOne({exp_id: exp_id}, {sort: {created: 1}}); //Pega a primeira session criada

				Sessions.update(session._id, {$set: {hearer_id:  Session.get('user_id')}});

				Router.go('experiment', {user_id: Session.get('user_id'), id: exp_id, user_type: 'hearer'});
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
			Descriptions.insert({ session_id: Session.get('session_id'), message: messageInput, created: Date.now()/1000 });

			document.getElementById('message').value = '';
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
				Session.set('wrong_input', true);
				return false;
			}
			
			var description = Descriptions.findOne({session_id: Session.get('session_id')}, {sort: {created: -1}});
			var problem = Problems.findOne(Session.get('problem_id'));

			var img = problem.img;

			img = img.substring(6,12);

			var test = Tests.findOne({img: img});

			var isCorrect = false;

			if(test.correct_answer == answer){
				isCorrect = true;

				Problems.update(Session.get('problem_id'), {$set: {isActive: false}});

			}else{
				Problems.update(Session.get('problem_id'), {$set: {created: Date.now()/1000}}); //atualiza seu created para que ele fique maior que todos e vá para o fim da fila
				console.log('Fim da fila problem '+Session.get('problem_id'));
			}
			
			var answer = Answers.insert({ session_id: Session.get('session_id'), description: description.message, answer: answer, isCorrect: isCorrect, created: Date.now()/1000 });
			//Verificar se resposta dada foi correta
		}
	});
	
	Template.hearer.waiting = function(){
		return amIwaiting('hearer', Session.get('session_id'));
	}

	Template.speaker.waiting = function(){
		return amIwaiting('speaker', Session.get('session_id'));
	}


	/**
	 * Esta parte dos problemas está BEM complicada. A parte complexa é que os usuários mudam de papel a cada session.
	 * Então o usuário que era speaker deve virar um hearer, depois voltar a ser speaker e por fim voltar a ser hearer.
	 * 
	 */

	Template.speaker.problem = function(){
		var problem = actualProblem(Session.get('session_id'));
		if(problem){
			return problem;
		}else{
			/**
			 * Verificar se pode ser criada mais uma sessão. Se puder, cria e muda os papeis.
			 * Caso não possa, redirecione para o fim do experimento.
			 */

			var session = Sessions.findOne({exp_id: Session.get('exp_id')}, {sort: {created: -1}});
			if(session.id == 4){
				Router.go('ending');
				return;
			}
			var new_id = session.id + 1;
			

			if(session.id == 1){ //Acabou a sessão 1 (prática). Começa a segunda sessão (prática)
				var new_session = Sessions.insert({exp_id: Session.get('exp_id'), id: new_id, created: Date.now()/1000, speaker_id: null, hearer_id: Session.get('user_id'), experiment_finished: false });
				Session.set('session_id', new_session);

				prepareSessionPractices(Session.get('exp_id'), conditions, types, flipped);
				Router.go('experiment', {id: Session.get('exp_id'), user_type: 'hearer'});

			}else{
				if(session.id == 2){//Acabou a sessão 2 (prática). Começa a terceira (experimento real)
					var new_session = Sessions.insert({exp_id: Session.get('exp_id'), id: new_id, created: Date.now()/1000, speaker_id: Session.get('user_id'), hearer_id: null, experiment_finished: false });
					Session.set('session_id', new_session);

					prepareSessionProblems(Session.get('exp_id'), conditions, types, flipped);
					Router.go('start_experiment', {user_type: 'hearer'});
				
				}else{
					if(session.id == 3){
						var new_session = Sessions.insert({exp_id: Session.get('exp_id'), id: new_id, created: Date.now()/1000, speaker_id: null, hearer_id: Session.get('user_id'), experiment_finished: false });
						Session.set('session_id', new_session);

						prepareSessionProblems(Session.get('exp_id'), conditions, types, flipped);
						Router.go('experiment', {id: Session.get('exp_id'), user_type: 'hearer'});
					}
				}
			}
			

		}
	};

	Template.hearer.problem = function(){
		var problem = actualProblem(Session.get('session_id'));
		if(problem){
			return problem;
		}else{
			/**
			 * Algoritmo diferente do problem pra speaker, pq o speaker criará a sessão nova
			 * O hearer quando der a busca no banco, descobrirá a nova já criada.
			 */
			
			var session = Sessions.findOne({exp_id: Session.get('exp_id')}, {sort: {created: -1}});
			Session.set('session_id', session._id);

			
			if(session.speaker_id == null || session.hearer_id == null){
				if(session.id == 2){ //Começou a sessão 2
					Router.go('experiment', {id: Session.get('exp_id'), user_type: 'speaker'});
					Sessions.update(session._id, {$set: {speaker_id:  Session.get('user_id')}});

				}else{
					if(session.id == 3){//Começou a sessão 3
						Router.go('start_experiment', {user_type: 'speaker'});

						Sessions.update(session._id, {$set: {hearer_id:  Session.get('user_id')}});

					}else{
						if(session.id == 4){//Acabou a sessão 2 (prática). Começa a terceira (experimento real)
							prepareSessionProblems(Session.get('exp_id'), conditions, types, flipped);
							Router.go('start_experiment', {user_type: 'speaker'});

							Sessions.update(session._id, {$set: {speaker_id:  Session.get('user_id')}});

							console.log('hearer: 4');
						}
					}
				}
			}else{
				if(session.id == 4){
					Router.go('ending');
					return;
				}
			}
		}
	};


	function amIwaiting(user,session_id){
		var description = Descriptions.findOne({session_id: session_id}, {sort: {created: -1}});
		var answer = Answers.findOne({session_id: session_id},  {sort: {created: -1}});

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
					return false;
				}else{
					return true;
				}
				return false;
			}
        }
    };


    function actualProblem(session_id){
    	var problem = Problems.findOne({session_id: session_id, isActive: true}, {sort: {created: 1}});
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
	var flipped = ['0','0','0','0','0','0','0','0','1','1','1','1','1','1','1','1'];

	/**
	 * Encontra a última sessão, dado o experimento e então cria os 16 problemas para a mesma.
	 */
    function prepareSessionProblems(exp_id, conditions, types, flipped){
    	var conditions = shuffleArray(conditions);
		var types = shuffleArray(types);
		var flipped = shuffleArray(flipped);

		for (var i = 0; i < 16; i++) {
			var img = 'type'+types[i]+'/'+conditions[i]+'-t'+types[i];
			var session = Sessions.findOne({exp_id: exp_id}, {sort: {created: -1}});
			Problems.insert({session_id: session._id, img: img, isFlipped: flipped[i], isActive: true, created: Date.now()/1000});
		};
    }
    //To-Do: perguntar pro Ivandre sobre setar resposta errada e ela voltar
    function prepareSessionPractices(exp_id, conditions, types, flipped){
    	var conditions = shuffleArray(conditions);
		var types = shuffleArray(types);
		var flipped = shuffleArray(flipped);

		for (var i = 0; i < 4; i++) {
			var img = 'type'+types[i]+'/'+conditions[i]+'-t'+types[i];
			var session = Sessions.findOne({exp_id: exp_id}, {sort: {created: -1}});
			Problems.insert({session_id: session._id, img: img, isFlipped: flipped[i], isActive: true, created: Date.now()/1000});
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

		console.log('tests and problems created');
	});
	
	
}

