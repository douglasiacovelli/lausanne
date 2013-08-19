Experiments = new Meteor.Collection('experiments');
Problems = new Meteor.Collection('problems');
Usuarios = new Meteor.Collection('usuarios');
Sessions = new Meteor.Collection('sessions');
Tests = new Meteor.Collection('tests');
Answers = new Meteor.Collection('answers');
Descriptions = new Meteor.Collection('descriptions');


//Declarando os arrays que serão utilizados para selecionar as imagens
var conditions = ['01f', '01o', '02f', '02o', '03f', '03o', '04f', '04o', '05f', '05o', '06f', '06o', '07f', '07o', '08f', '08o'];
var types = ['1','1','1','1','1','1','1','1','2','2','2','2','2','2','2','2'];
var flipped = ['0','0','0','0','0','0','0','0','1','1','1','1','1','1','1','1'];

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

Router.map(function() { 
	this.route('home', {
		path: '/'
	});

	this.route('start', {
		path: '/:user_id/start'
	});

	this.route('experiments', {
		path: '/experiments',
		data: function () {
			return {experiments: Experiments.find()}
		}
	});

	this.route('experiment', {
		path: '/experiment/:user_id/:id/:user_type',
		controller: 'ExperimentController',
		action: 'user_type'

	});
});

ApplicationController = RouteController.extend({
	// layout: 'layout',
	loadingTemplate: 'loading'
	// notFoundTemplate: 'notFound'
});

ExperimentController = ApplicationController.extend({
	
	
	data: function(){
		
		var exp_id = parseInt(this.params.id);

		Session.set('exp_id', exp_id);

		var result_experiments = Experiments.findOne({id: exp_id});

		var description = Descriptions.findOne({exp_id: exp_id}, {sort: {time: -1}});

		return {
	        'experiment': result_experiments,
	        'img': '1',
	        'description': description
    	}
	},
	
	user_type: function(){
		if(this.params.user_type == 'speaker'){
			this.render('speaker');
		}else{
			this.render('hearer');
		}
		

	}

	// hearer: function(){
	// 	this.render({template: 'hearer'});
	// }
});

if (Meteor.isClient) {

	Meteor.startup(function() {
	    // so you can know if you've successfully in-browser browsed
	    console.log('Started at ' + location.href);
	});

	Deps.autorun(function(){
		Meteor.subscribe('userData');
	});

	Session.setDefault('exp_id', null);
	Session.setDefault('user_id', null);
	Session.setDefault('wrong_input', false);
	Session.setDefault('tests_queue', false);
	

	
	
	Template.home.wrong_input = function(){
		if(Session.get('wrong_input') == true){
			return true;
		}else{
			return false;
		}
	}

	Template.home.events({

		'click #button-accept' : function() {
			var age = document.getElementById('age').value;
			if(age){
				
				if(!isNaN(age)){

					age = parseInt(age);
				}else{
					Session.set('wrong_input', true);
				}
			}else{
				Session.set('wrong_input', true);
				return;
			}

			var gender = document.getElementById('gender');
			var gender = gender.options[gender.selectedIndex].value;

			var handwriting = document.getElementById('handwriting');
			var handwriting = handwriting.options[handwriting.selectedIndex].value;

			if(gender == '' || handwriting == ''){
				Session.set('wrong_input', true);
				console.log('vazio');
				return;
			}

			var user_id = Usuarios.insert({ age: age, gender: gender, handwriting: handwriting , created: Date.now()});
			Session.set('user_id', user_id);
			console.log('user'+Session.get('user_id'));

			Router.go('start', {user_id: user_id});

			return;

			Experiments.insert({ id: exp_id, name: 'Experimento'+exp_id, time: Date.now()/1000 });
			
			Router.go('experiment', {id: exp_id, user_type: 'speaker'});
			
		}
	});

	

	Template.start.wrong_input = function(){
		if(Session.get('wrong_input') == true){
			return true;
		}else{
			return false;
		}
	}

	/* Este método é executado assim que no template home for clicado
	 * o botão de id "create". Ele buscará o último registro para que
	 * seja feita uma implementação do autoincrement no id. Este id
	 * foi criado para facilitar a comunicação entre os participantes
	 * do experimento. Além disso, é criado uma nova entrada de experimento.
	 */

	Template.start.events({

		'click #create' : function() {
			var exp_id = Experiments.findOne({}, {sort: {time: -1}});
			if(exp_id){
				exp_id = exp_id.id;
				exp_id++;	
			}else{
				exp_id = 1;
			}
			
			conditions = shuffleArray(conditions);
			types = shuffleArray(types);
			flipped = shuffleArray(flipped);
			
			console.log(conditions);
			console.log(types);
			console.log(flipped);
			
			//TO-DO: criar lista de testes a serem executados
			//Criar Sessions
			//return;

			Experiments.insert({ id: exp_id, name: 'Experimento'+exp_id, time: Date.now()/1000 });
			
			Router.go('experiment', {user_id: Session.get('user_id'), id: exp_id, user_type: 'speaker'});
			
		},

		'submit #enter' : function() {
			var exp_id = document.getElementById('enter-input').value;
			if(exp_id){
				
				// verifica se valor entrado é um número: 'isNaN' - retorna true se não for número
				// SE FOR UM NÚMERO:
					// Faz a conversão do input para número e redireciona a pessoa para a página do experimento
					// wrong_input serve para o template saber se deve adicionar ou não a msg de erro (experimento inválido)
					// Deve-se verificar se o experimento existe e é válido. Se for, ok.
				
				// SE NÃO FOR:
					//wrong_input é true e então é exibida a msg de erro no template
				if(!isNaN(exp_id)){

					exp_id = parseInt(exp_id);
					
					Router.go('experiment', {user_id: Session.get('user_id'), id: exp_id, user_type: 'hearer'});
					Session.set('wrong_input', false);

				}else{
					Session.set('wrong_input', true);
				}
				// TO-DO: verificar se experimento existe no banco e se está ativo
			}
			Session.set('wrong_input', true);
			
		},

		'click #enter_btn' : function() {
			var exp_id = document.getElementById('enter-input').value;
			if(exp_id){
				
				// verifica se valor entrado é um número: 'isNaN' - retorna true se não for número
				// SE FOR UM NÚMERO:
					// Faz a conversão do input para número e redireciona a pessoa para a página do experimento
					// wrong_input serve para o template saber se deve adicionar ou não a msg de erro (experimento inválido)
					// Deve-se verificar se o experimento existe e é válido. Se for, ok.
				
				// SE NÃO FOR:
					//wrong_input é true e então é exibida a msg de erro no template
				if(!isNaN(exp_id)){

					exp_id = parseInt(exp_id);
					
					Router.go('experiment', {user_id: Session.get('user_id'), id: exp_id, user_type: 'hearer'});
					Session.set('wrong_input', false);

				}else{
					Session.set('wrong_input', true);
				}
				// TO-DO: verificar se experimento existe no banco e se está ativo
			}
			Session.set('wrong_input', true);
			
		}
	});
	
	

	Template.speaker.events({
		'submit #submitDescription' : function() {
			messageInput = document.getElementById('message').value;
			console.log(this.params);
			Descriptions.insert({ exp_id: Session.get('exp_id'), message: messageInput, time: Date.now()/1000 });

		}
	});

	Template.speaker.waiting = function(){
		var description = Descriptions.findOne({exp_id: Session.get('exp_id')}, {sort: {time: -1}});
		var answer = Answers.findOne({exp_id: Session.get('exp_id')},  {sort: {time: -1}});
		
		if(description && !answer){
			return true;
		}else{
			if(!description){
				return false;
			}

			if(answer.time > description.time){
				return false;
			}else{
				return true;
			}
			
		}
	};

	Template.hearer.waiting = function(){
		var description = Descriptions.findOne({exp_id: Session.get('exp_id')}, {sort: {time: -1}});
		var answer = Answers.findOne({exp_id: Session.get('exp_id')},  {sort: {time: -1}});
		
		if(description && !answer){
			return false;
		}else{
			if(!description){
				return true;
			}

			if(answer.time > description.time){
				return true;
			}else{
				return false;
			}
			
		}
	};

	Session.setDefault('currentRoomId', null);

}

if (Meteor.isServer) {

	Meteor.startup(function () {
		Tests.insert({type: 1, condition: '01f', correct_answer: 'H'});
		Tests.insert({type: 1, condition: '01o', correct_answer: 'H'});
		Tests.insert({type: 1, condition: '02f', correct_answer: 'O'});
		Tests.insert({type: 1, condition: '02o', correct_answer: 'O'});
		Tests.insert({type: 1, condition: '03f', correct_answer: 'M'});
		Tests.insert({type: 1, condition: '03o', correct_answer: 'M'});
		Tests.insert({type: 1, condition: '04f', correct_answer: 'A'});
		Tests.insert({type: 1, condition: '04o', correct_answer: 'A'});
		Tests.insert({type: 1, condition: '05f', correct_answer: 'M'});
		Tests.insert({type: 1, condition: '05o', correct_answer: 'M'});
		Tests.insert({type: 1, condition: '06f', correct_answer: 'H'});
		Tests.insert({type: 1, condition: '06o', correct_answer: 'H'});
		Tests.insert({type: 1, condition: '07f', correct_answer: 'I'});
		Tests.insert({type: 1, condition: '07o', correct_answer: 'I'});
		Tests.insert({type: 1, condition: '08f', correct_answer: 'A'});
		Tests.insert({type: 1, condition: '08o', correct_answer: 'A'});
		Tests.insert({type: 2, condition: '01f', correct_answer: 'H'});
		Tests.insert({type: 2, condition: '01o', correct_answer: 'H'});
		Tests.insert({type: 2, condition: '02f', correct_answer: 'O'});
		Tests.insert({type: 2, condition: '02o', correct_answer: 'O'});
		Tests.insert({type: 2, condition: '03f', correct_answer: 'M'});
		Tests.insert({type: 2, condition: '03o', correct_answer: 'M'});
		Tests.insert({type: 2, condition: '04f', correct_answer: 'A'});
		Tests.insert({type: 2, condition: '04o', correct_answer: 'A'});
		Tests.insert({type: 2, condition: '05f', correct_answer: 'M'});
		Tests.insert({type: 2, condition: '05o', correct_answer: 'M'});
		Tests.insert({type: 2, condition: '06f', correct_answer: 'H'});
		Tests.insert({type: 2, condition: '06o', correct_answer: 'H'});
		Tests.insert({type: 2, condition: '07f', correct_answer: 'I'});
		Tests.insert({type: 2, condition: '07o', correct_answer: 'I'});
		Tests.insert({type: 2, condition: '08f', correct_answer: 'A'});
		Tests.insert({type: 2, condition: '08o', correct_answer: 'A'});
		console.log('tests created');
	});
	
}

