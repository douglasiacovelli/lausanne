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

		var description = Descriptions.findOne({session_id: Session.get('session_id')}, {sort: {created: -1}});

		return {'experiment': result_experiments,
				'description': description};
	},

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

	Deps.autorun(function(){
		Meteor.subscribe('userData');
	});

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

	Template.home.events({

		'submit #add-user' : function() {
			var age = document.getElementById('age').value;
			age = parseInt(age);

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

			Session.set('wrong_input', false);
			Router.go('start', {user_id: user_id});

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
			var exp_id = Experiments.findOne({}, {sort: {created: -1}});
			
			if(exp_id){
				exp_id = exp_id.id;
				exp_id++;	
			}else{
				exp_id = 1;
			}

			Experiments.insert({ id: exp_id, created: Date.now()/1000});
			var session = Sessions.insert({exp_id: exp_id, id: 1, created: Date.now()/1000, speaker_id: Session.get('user_id'), hearer_id: null });
			
			Session.set('session_id', session);

			conditions = shuffleArray(conditions);
			types = shuffleArray(types);
			flipped = shuffleArray(flipped);

			for (var i = 0; i < 16; i++) {
				var img = 'type'+types[i]+'/'+conditions[i]+'-t'+types[i];
				var session = Sessions.findOne({exp_id: exp_id}, {sort: {created: -1}});
				Problems.insert({session_id: session._id, img: img, isFlipped: flipped[i], isActive: true, created: Date.now()/1000});
			};
			
			console.log(conditions);
			console.log(types);
			console.log(flipped);
			
			
			
			Router.go('experiment', {user_id: Session.get('user_id'), id: exp_id, user_type: 'speaker'});
			
		},

		'submit #enter' : function() {
			var exp_id = document.getElementById('enter-input').value;
			if(exp_id){
				
				// Faz a conversão do input para número e redireciona a pessoa para a página do experimento
				// wrong_input serve para o template saber se deve adicionar ou não a msg de erro (experimento inválido)
				
				// To-Do: Deve-se verificar se o experimento existe e é válido. Se for, ok.

				exp_id = parseInt(exp_id);
				
				var session = Sessions.findOne({exp_id: exp_id}, {sort: {created: 1}}); //Pega a primeira session criada

				Sessions.update(session._id, {$set: {hearer_id:  Session.get('user_id')}});

				Router.go('experiment', {user_id: Session.get('user_id'), id: exp_id, user_type: 'hearer'});
				Session.set('wrong_input', false);

				var session = Sessions.findOne({exp_id: exp_id}, {sort: {created: -1}});
				Session.set('session_id', session._id);
				

				
				// TO-DO: verificar se experimento existe no banco e se está ativo
			}
			Session.set('wrong_input', true);
			
		 }
	});
	

	Template.speaker.events({
		'submit #submitDescription' : function() {
			messageInput = document.getElementById('message').value;
			//console.log(this.params);
			Descriptions.insert({ session_id: Session.get('session_id'), message: messageInput, created: Date.now()/1000 });

			document.getElementById('message').value = '';
			console.log('input limpo');
		}
	});

	Template.hearer.events({
		'submit #submitAnswer' : function() {
			var answer = document.getElementById('answer_select');
			var answer = answer.options[answer.selectedIndex].value;

			if(answer == ''){
				Session.set('wrong_input', true);
				console.log('vazio');
				return;
			}
			Session.set('wrong_input', false);

			var description = Descriptions.findOne({session_id: Session.get('session_id')}, {sort: {created: -1}});
			var problem = Problems.findOne(Session.get('problem_id'));

			var img = problem.img;

			img = img.substring(6,12);
			console.log(img);

			var test = Tests.findOne({img: img});
			console.log(test);


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

	Template.speaker.waiting = function(){
		var description = Descriptions.findOne({session_id: Session.get('session_id')}, {sort: {created: -1}});
		var answer = Answers.findOne({session_id: Session.get('session_id')}, {sort: {created: -1}});
		
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
	};

	Template.hearer.waiting = function(){
		var description = Descriptions.findOne({session_id: Session.get('session_id')}, {sort: {created: -1}});
		var answer = Answers.findOne({session_id: Session.get('session_id')},  {sort: {created: -1}});
		
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
	};

	Template.speaker.problem = function(){
		var session = Sessions.findOne({exp_id: Session.get('exp_id')},{sort: {created: -1}}); //Pega a última sessão do experimento atual
		if(session){
			var problem = Problems.findOne({session_id: session._id, isActive: true}, {sort: {created: 1}});
			Session.set('problem_id', problem._id)
			
			return problem;
		}else{
			return null;
		}
	};

	Template.hearer.problem = function(){
		var session = Sessions.findOne({exp_id: Session.get('exp_id')},{sort: {created: -1}}); //Pega a última sessão do experimento atual
		if(session){
			var problem = Problems.findOne({session_id: session._id, isActive: true});
			Session.set('problem_id', problem._id)

			return problem;
		}else{
			return null;
		}
	};


	Session.setDefault('currentRoomId', null);

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
		console.log('tests created');
	});
	
}

