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

		var result_experiments = Experiments.findOne({id: exp_id});
		return {
	        'experiment': result_experiments,
	        'img': '1'
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
			
			Router.go('experiment', {id: exp_id, user_type: 'speaker'});
			
		}
	});

	Session.setDefault('currentRoomId', null);

}

if (Meteor.isServer) {

	Meteor.startup(function () {
		// code to run on server at startup
	});
}

