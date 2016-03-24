//Select polja za odabir vremenske zone

$('#time-zone-region').on('change', function() { //Chosen.js listener za promjenu vremeske zone regije
	populateLocation();
});

function populateLocation(){
	var selected_zone = $('#time-zone-region').val();
	var region_array = zones_data[selected_zone]; //Dohvaćanje podataka
	$('#time-zone-location').empty(); 
	region_array.forEach(function(location) {
		$('#time-zone-location').append('<option value="' + location.value + '">' + location.name + '</option>');
	});
	$('#time-zone-location').trigger('chosen:updated');
}

function populateLocationOnLoad(dbData){
	var selected_zone = $('#time-zone-region').val();
	var region_array = zones_data[selected_zone]; //Dohvaćanje podataka
	region_array.forEach(function(location) {
		if ( location.value == dbData ) {
			$("#time-zone-location option[value='" +location.value+ "']").prop('selected', true);			
			$('#time-zone-location').trigger('chosen:updated');
		}
	});
}