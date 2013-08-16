Experiments = new Meteor.Collection('experiments');


Router.map(function() { 
	this.route('home', {
		path: '/'
	});

	// this.route('experiment', {
	// 	path: '/experiment/:id',
	// 	controller: 'ExperimentController'
		
	// 	// function() { return this.params.id }});
	// });

	this.route('experiment', {
		path: '/experiment/:id',
		controller: 'ExperimentController'
		
		// function() { return this.params.id }});
	});

	this.route('speaker', {
		path: '/experiment/:id/speaker',
		controller: 'ExperimentController'
		
		// function() { return this.params.id }});
	});

	this.route('hearer', {
		path: '/experiment/:id/hearer',
		controller: 'ExperimentController'
		
		// function() { return this.params.id }});
	});
});

ApplicationController = RouteController.extend({
	// layout: 'layout',
	// loadingTemplate: 'loading',
	// notFoundTemplate: 'notFound'
});

ExperimentController = ApplicationController.extend({
	
	
	data: function(){
		
		var exp_id = parseInt(this.params.id);

		var result_experiments = Experiments.findOne({id: exp_id});
		return result_experiments;
	},

	speaker: function(){
		this.render({template: 'speaker'});
	},

	hearer: function(){
		this.render({template: 'hearer'});
	}
});

if (Meteor.isClient) {

	Meteor.startup(function() {
	    // so you can know if you've successfully in-browser browsed
	    console.log('Started at ' + location.href);
	});

	/* Este método é executado assim que no template home for clicado
	 * o botão de id "create". Ele buscará o último registro para que
	 * seja feita uma implementação do autoincrement no id. Este id
	 * foi criado para facilitar a comunicação entre os participantes
	 * do experimento. Além disso, é criado uma nova entrada de experimento.
	 */

	Template.home.events({
		'click button#create' : function() {
			var exp_id = Experiments.findOne({}, {sort: {time: -1}});
			if(exp_id){
				exp_id = exp_id.id;
				exp_id++;	
			}else{
				exp_id = 1;
			}
			
			Experiments.insert({ id: exp_id, name: 'Experiment '+exp_id, time: Date.now()/1000 });
			
			/*
				if(user.type == 'speaker'){
					Router.go('experiment', {id: exp_id, user_type: speaker'});
				}else{
					Router.go('experiment', {id: exp_id, user_type: 'hearer'});
				}
			*/
			Router.go('experiment', {id: exp_id});
			//console.log('criado'+id);
		}
	});

	// Template.experiment.experiments = function(){
	// 	return Experiments.find({}, {sort: {time: -1}});
	// }

	Session.setDefault('currentRoomId', null);

}

if (Meteor.isServer) {

	Meteor.startup(function () {
		// code to run on server at startup
	});
}

