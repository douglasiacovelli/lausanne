Experiments = new Meteor.Collection('experiments');
Descriptions = new Meteor.Collection('descriptions');



Router.map(function() { 
	this.route('home', {
		path: '/'
	});

	this.route('experiments', {
		path: '/experiments',
		data: function () {
			return {experiments: Experiments.find()}
		}
	});

	this.route('experiment', {
		path: '/experiment/:id/:user_type',
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

	Session.setDefault('exp_id', null);
	Session.setDefault('wrong_input', false);
	
	/* Este método é executado assim que no template home for clicado
	 * o botão de id "create". Ele buscará o último registro para que
	 * seja feita uma implementação do autoincrement no id. Este id
	 * foi criado para facilitar a comunicação entre os participantes
	 * do experimento. Além disso, é criado uma nova entrada de experimento.
	 */

	Template.home.events({
		'click #create' : function() {
			var exp_id = Experiments.findOne({}, {sort: {time: -1}});
			if(exp_id){
				exp_id = exp_id.id;
				exp_id++;	
			}else{
				exp_id = 1;
			}
			
			Experiments.insert({ id: exp_id, name: 'Experimento'+exp_id, time: Date.now()/1000 });
			
			Router.go('experiment', {id: exp_id, user_type: 'speaker'});
			
		},
		'click #enter' : function() {
			var exp_id = document.getElementById('enter-input').value;
			if(exp_id){
				
				// verifica se valor entrado é um número: isNaN - retorna true se não for número
				if(!isNaN(exp_id)){

					//Faz a conversão do input para número e redireciona a pessoa para a página do experimento
					exp_id = parseInt(exp_id);

					Session.set('wrong_input', false);
					Router.go('experiment', {id: exp_id, user_type: 'hearer'});
				}else{
					console.log('eerroou');
					Session.set('wrong_input', true);
				}
				// TO-DO: verificar se experimento existe no banco e se está ativo
			}
			console.log('eerroou');
			Session.set('wrong_input', true);
			
		}
	});

	
	
	Template.home.wrong_input = function(){
		if(Session.get('wrong_input') == true){
	    	return true;
	    }else{
	    	return false;
	    }
	}

	Template.speaker.events({
		'click #submitDescription' : function() {
			messageInput = document.getElementById('message').value;
			console.log(this.params);
			Descriptions.insert({ exp_id: Session.get('exp_id'), message: messageInput, time: Date.now()/1000 });
		}
	});

	Session.setDefault('currentRoomId', null);

}

if (Meteor.isServer) {

	Meteor.startup(function () {
		// code to run on server at startup
	});
}

