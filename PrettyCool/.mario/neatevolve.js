Buttons = {
	Left:  { on:{which:37,type:true}, off:{which:37,type:false} },
	Up:    { on:{which:38,type:true}, off:{which:38,type:false} },
	Right: { on:{which:39,type:true}, off:{which:39,type:false} },
	Down:  { on:{which:40,type:true}, off:{which:40,type:false} },
	Sprint:{ on:{which:16,type:true}, off:{which:16,type:false} }
};
ButtonNames = Object.keys(Buttons);

function touchButton(button) { if (button.type) { keydown(button.which); } else { keyup(button.which); } }

joypad = {
	set: function(controller) {
		for (var o=0;o<Outputs;o++) {
			if (controller[ButtonNames[o]])
				touchButton( Buttons[ButtonNames[o]]["on"] );
			else 
				touchButton( Buttons[ButtonNames[o]]["off"] );
		}
	}
}

Population = 50
DeltaDisjoint = 2.0
DeltaWeights = 0.4
DeltaThreshold = 1.0

StaleSpecies = 5

MutateConnectionsChance = 0.25
PerturbChance = 0.90
CrossoverChance = 0.75
LinkMutationChance = 2.0
NodeMutationChance = 0.50
BiasMutationChance = 0.40
StepSize = 0.1
DisableMutationChance = 0.4
EnableMutationChance = 0.2

MaxNodes = 1000000

Radius = 6;
Side = (2*Radius+1);
dascale = 32;
Inputs = Side*Side*2;
Outputs = 5; // on and off of 5 buttons

String.prototype.hashCode = function() {
    var hash = 0, i, chr, len;
    if (this.length === 0) return hash;
    for (i = 0, len = this.length; i < len; i++) {
        chr   = this.charCodeAt(i);
        hash  = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
};
var saveKey=window.location.pathname.hashCode()+"BACKUPMARIO",
storage=(function(){
	var a;
	try{a=window.localStorage;a.setItem("test","1");a.removeItem("test");a.setItem("test","2");
	if(a.getItem("test")==="2")return a}catch(d){}
	return {data:{},
	setItem:function(a,b){this.data[a]=String(b);return this.data[a]},
	getItem:function(a){return this.data.hasOwnProperty(a)?this.data[a]:undefined},
	removeItem:function(a){return delete this.data[a]},
	clear:function(){return this.data={}}};
})();
function writeFile() { storage.setItem(saveKey,JSON.stringify(pool)); }
function loadFile() { var st = storage.getItem(saveKey); if (st) { pool = JSON.parse(st); } }

function newInnovation() { return pool.innovation++; }

function newPool() {
	var pool = {}
	pool.species = []
	pool.generation = 0
	pool.innovation = Outputs
	pool.currentSpecies = 0
	pool.currentGenome = 0
	pool.maxFitness = 0
	pool.curFitness = 0;
	pool.frame = 0;
	return pool
}

function newSpecies() {
	var species = {}
	species.topFitness = 0
	species.staleness = 0
	species.genomes = []
	species.averageFitness = 0
	
	return species
}

function newGenome(){
	var genome = {}
	genome.genes = []
	genome.fitness = 0
	genome.network = {}
	genome.maxneuron = 0
	genome.globalRank = 0
	genome.mutationRates = {}
	genome.mutationRates["connections"] = MutateConnectionsChance
	genome.mutationRates["link"] = LinkMutationChance
	genome.mutationRates["bias"] = BiasMutationChance
	genome.mutationRates["node"] = NodeMutationChance
	genome.mutationRates["enable"] = EnableMutationChance
	genome.mutationRates["disable"] = DisableMutationChance
	genome.mutationRates["step"] = StepSize
	
	return genome
}

function newGene() {
	var gene = {}
	gene.into = 0
	gene.out = 0
	gene.weight = 0.0
	gene.enabled = true
	gene.innovation = 0
	
	return gene
}

function newNeuron() {
	var neuron = {}
	neuron.incoming = []
	neuron.value = 0.0
	
	return neuron
}

function copyGene(gene){
	var gene2 = newGene()
	gene2.into = gene.into
	gene2.out = gene.out
	gene2.weight = gene.weight
	gene2.enabled = gene.enabled
	gene2.innovation = gene.innovation
	
	return gene2
}

function copyGenome(genome){
	var genome2 = newGenome()
	for (var g=0; g<genome.genes.length;g++)
		genome2.genes.push( copyGene(genome.genes[g]) )
	genome2.maxneuron = genome.maxneuron
	genome2.mutationRates["connections"] = genome.mutationRates["connections"]
	genome2.mutationRates["link"] = genome.mutationRates["link"]
	genome2.mutationRates["bias"] = genome.mutationRates["bias"]
	genome2.mutationRates["node"] = genome.mutationRates["node"]
	genome2.mutationRates["enable"] = genome.mutationRates["enable"]
	genome2.mutationRates["disable"] = genome.mutationRates["disable"]
	
	return genome2
}

function pointMutate(genome){
	var step = genome.mutationRates["step"]
	
	for (var i=0;i<genome.genes.length;i++){
		var gene = genome.genes[i]
		if (Math.random() < PerturbChance)
			gene.weight += step*(Math.random()*2-1)
		else
			gene.weight = Math.random()*4-2
	}
}

function randomNeuron(genes, nonInput){
	var neurons = {}
	var count = 0;
	if (!nonInput) {
		for (var i=0;i<Inputs;i++) {
			neurons[i] = true;
			count++;
		}
	}
	for (var o=0; o<Outputs;o++) {
		neurons[MaxNodes+o] = true
		count++;
	}
	for (var i=0;i<genes.length;i++) {
		if (!nonInput || genes[i].into >= Inputs) {
			neurons[genes[i].into] = true
			count++
		} if (!nonInput || genes[i].out >= Inputs) {
			neurons[genes[i].out] = true
			count++
		}
	}

	var n = Math.floor(Math.random()*count);
	for (var key in neurons) {
	if (neurons.hasOwnProperty(key)) {
		if (n-- === 0) return key;
	}}
	return 0;
}

function containsLink(genes, link){
	for (var i=0; i<genes.length;i++) {
		var gene = genes[i]
		if (gene.into == link.into && gene.out == link.out) return true
	}
}

function linkMutate(genome, forceBias){
	var neuron1 = randomNeuron(genome.genes, false)
	var neuron2 = randomNeuron(genome.genes, true)
	
	if (neuron1 < Inputs && neuron2 < Inputs) return;
	
	if (neuron2 < Inputs) neuron2 = [neuron1, neuron1 = neuron2][0];
		 
	var newLink = newGene()
	
	newLink.into = neuron1
	newLink.out = neuron2
	if (forceBias) newLink.into = Inputs
	
	if ( containsLink(genome.genes, newLink) )return;

	newLink.innovation = newInnovation()
	newLink.weight = Math.random()*4-2
	
	genome.genes.push(newLink)
}

function nodeMutate(genome){
	if (genome.genes.length === 0) return;

	genome.maxneuron++;
	
	var gene = genome.genes[Math.floor(Math.random()*genome.genes.length)]
	if (!gene.enabled) return;
	gene.enabled = false
	
	var gene1 = copyGene(gene)
	gene1.out = genome.maxneuron
	gene1.weight = 1.0
	gene1.innovation = newInnovation()
	gene1.enabled = true
	genome.genes.push(gene1)
	
	var gene2 = copyGene(gene)
	gene2.into = genome.maxneuron
	gene2.innovation = newInnovation()
	gene2.enabled = true
	genome.genes.push(gene2)
}

function enableDisableMutate(genome, enable){
	var candidates = []
	for (var i=0;i<genome.genes.length;i++) {
		var gene = genome.genes[i]
		if (gene.enabled === !enable)
			candidates.push(gene)
	}

	if (candidates.length === 0) return;

	var gene = candidates[Math.floor(Math.random()*candidates.length)]
	gene.enabled = !gene.enabled
}

function mutate(genome){
	for (var mutation in genome.mutationRates) {
	if (genome.mutationRates.hasOwnProperty(mutation)) {
		if (Math.random() < .5) {
			genome.mutationRates[mutation] *= 0.95
		} else {
			genome.mutationRates[mutation] *= 1.05263
		}
		genome.mutationRates[mutation]
	}}

	if (Math.random() < genome.mutationRates["connections"])
		pointMutate(genome)
	
	var p = genome.mutationRates["link"]
	while (p > 0){
		if (Math.random() < p--)
			linkMutate(genome, false)
	}

	p = genome.mutationRates["bias"]
	while (p > 0) {
		if (Math.random() < p--)
			linkMutate(genome, true)
	}
	
	p = genome.mutationRates["node"]
	while (p > 0) {
		if (Math.random() < p--)
			nodeMutate(genome)
	}
	
	p = genome.mutationRates["enable"]
	while (p > 0) {
		if (Math.random() < p--)
			enableDisableMutate(genome, true)
	}

	p = genome.mutationRates["disable"]
	while (p > 0) {
		if (Math.random() < p--)
			enableDisableMutate(genome, false)
	}
}

function basicGenome(){
	var genome = newGenome()

	genome.maxneuron = Inputs
	mutate(genome)
	
	return genome
}

function crossover(g1, g2){
	// Make sure g1 is the higher fitness genome
	if (g2.fitness > g1.fitness) g2 = [g1, g1 = g2][0];

	var child = newGenome()
	
	var innovations2 = {}
	for (var i=0;i<g2.genes.length;i++){
		var gene = g2.genes[i]
		innovations2[gene.innovation] = gene
	}	
	
	for (var i=0;i<g1.genes.length;i++){
		var gene1 = g1.genes[i]
		var gene2 = innovations2[gene1.innovation]
		if ( typeof gene2 != "undefined" && Math.random() < .5 && gene2.enabled)
			child.genes.push(copyGene(gene2))
		else
			child.genes.push(copyGene(gene1))
	}
	
	child.maxneuron = Math.max(g1.maxneuron,g2.maxneuron)
	
	for (var mutation in g1.mutationRates) {
	if (g1.mutationRates.hasOwnProperty(mutation)) {
		child.mutationRates[mutation] = g1.mutationRates[mutation]
	}}
	
	return child
}

function breedChild(species) {
	var child = {}
	if (Math.random() < CrossoverChance) {
		var g1 = species.genomes[Math.floor(Math.random()*species.genomes.length)]
		var g2 = species.genomes[Math.floor(Math.random()*species.genomes.length)]
		child = crossover(g1, g2)
	} else {
		var g = species.genomes[Math.floor(Math.random()*species.genomes.length)]
		child = copyGenome(g)
	}
	
	mutate(child)
	
	return child
}

function generateNetwork(genome){
	var network = {}
	network.neurons = {}
	
	for (var i=0;i<Inputs;i++) network.neurons[i] = newNeuron()
	for (var o=0;o<Outputs;o++) network.neurons[MaxNodes+o] = newNeuron()
	
	//sorted such that low out values come first
	genome.genes.sort( function (a,b) { return (a.out - b.out); } );
	
	for (var i=0;i<genome.genes.length;i++){
		var gene = genome.genes[i]
		if (gene.enabled){
			if ( typeof network.neurons[gene.out] === 'undefined' )
				network.neurons[gene.out] = newNeuron()
			var neuron = network.neurons[gene.out]
			neuron.incoming.push(gene)
			if ( typeof network.neurons[gene.into] === 'undefined' )
				network.neurons[gene.into] = newNeuron()
		}
	}
	genome.network = network
}

function evaluateNetwork(network, inputs){
	if (inputs.length != Inputs) {
		console.log("Incorrect number of neural network inputs.")
		return {}
	}
	
	for (var i=0; i<Inputs; i++) network.neurons[i].value = inputs[i]
	
	for (var k in network.neurons) {
	if (network.neurons.hasOwnProperty(k)) {
		var neuron = network.neurons[k];
		
		var sum = 0
		for (var j=0; j<neuron.incoming.length;j++) {
			var incoming = neuron.incoming[j]
			var other = network.neurons[incoming.into]
			sum += incoming.weight * other.value
		}
		
		if ( neuron.incoming.length > 0 ) neuron.value = sigmoid(sum)
	}}
	
	var outputs = {}
	for (var o=0;o<Outputs;o++) {
		if (network.neurons[MaxNodes+o].value > 0)
			outputs[ButtonNames[o]] = true
		else
			outputs[ButtonNames[o]] = false
	}
	
	return outputs
}

function disjoint(genes1, genes2){
	var i1 = {}
	
	for (var i=0;i<genes1.length;i++) {
		var gene = genes1[i]
		i1[gene.innovation] = true
	}

	var i2 = {}
	for (var i=0;i<genes2.length;i++) {
		var gene = genes2[i]
		i2[gene.innovation] = true
	}
	
	var disjointGenes = 0
	for (var i=0;i<genes1.length;i++) {
		var gene = genes1[i]
		if (!i2[gene.innovation]) disjointGenes++;
	}
	
	for (var i=0;i<genes2.length;i++) {
		var gene = genes2[i]
		if (!i1[gene.innovation]) disjointGenes++;
	}
	
	var n = Math.max(genes1.length, genes2.length)
	
	return disjointGenes / n
}

function weights(genes1, genes2){
	var i2 = {}
	
	for (var i=0;i<genes2.length;i++) {
		var gene = genes2[i]
		i2[gene.innovation] = gene
	}

	var sum = 0
	var coincident = 0
	for (var i=0;i<genes1.length;i++) {
		var gene = genes1[i]
		if (typeof i2[gene.innovation] != "undefined"){
			var gene2 = i2[gene.innovation]
			sum += Math.abs(gene.weight - gene2.weight)
			coincident++;
		}
	}
	
	return sum / coincident
}

function rankGlobally() {
	var global = []
	for (var s=0;s<pool.species.length;s++) {
		var species = pool.species[s]
		for (var g=0;g<species.genomes.length;g++)
			global.push(species.genomes[g])
	}		
	//sorted such that low fitness scores come first
	global.sort(function (a,b){return (a.fitness - b.fitness);} );
	//Higher Rank Better Genome
	for (var g=0;g<global.length;g++) global[g].globalRank = g
}

function calculateAverageFitness(species){
	var total = 0
	
	for (var g=0;g<species.genomes.length;g++) {
		var genome = species.genomes[g]
		total += genome.globalRank
	}
	
	species.averageFitness = total / species.genomes.length
}

function totalAverageFitness(){
	var total = 0
	for (var s=0;s<pool.species.length;s++) {
		var species = pool.species[s]
		total += species.averageFitness
	}

	return total
}

function cullSpecies(cutToOne) {
	for (var s=0;s<pool.species.length;s++){
		var species = pool.species[s]
		
		//sorted so that high fitness is first
		species.genomes.sort(function (a,b){return (b.fitness - a.fitness);} );
		
		var remaining = Math.ceil(species.genomes.length/2)
		if (cutToOne) remaining = 1
			
		while (species.genomes.length > remaining)
			species.genomes.pop()
	}
}

function removeStaleSpecies() {
	var survived = []

	for (var s=0;s<pool.species.length;s++) {
		var species = pool.species[s]
		
		//sorted so the first one is top fitness
		species.genomes.sort(function (a,b){return (b.fitness - a.fitness);} );
		
		if (species.genomes[0].fitness > species.topFitness ) {
			species.topFitness = species.genomes[0].fitness
			species.staleness = 0
		} else species.staleness++;

		if (species.staleness < StaleSpecies || species.topFitness >= pool.maxFitness)
			survived.push(species)
	}

	pool.species = survived
}

function removeWeakSpecies() {
	var survived = []

	var sum = totalAverageFitness()
	for (var s=0;s<pool.species.length;s++) {
		var species = pool.species[s]
		breed = Math.floor(species.averageFitness / sum * Population)
		if (breed >= 1) survived.push(species)
	}

	pool.species = survived
}

function sameSpecies(genome1, genome2){
	var dd = DeltaDisjoint*disjoint(genome1.genes, genome2.genes)
	var dw = DeltaWeights*weights(genome1.genes, genome2.genes) 
	return dd + dw < DeltaThreshold
}

function addToSpecies(child) {
	var foundSpecies = false
	for (var s=0;s<pool.species.length;s++) {
		var species = pool.species[s]
		if (sameSpecies(child, species.genomes[0])) {
			species.genomes.push(child)
			foundSpecies = true;
			break;
		}
	}
	
	if (!foundSpecies) {
		var childSpecies = newSpecies()
		childSpecies.genomes.push(child)
		pool.species.push(childSpecies)
	}
}

function newGeneration() {
	cullSpecies(false) // Cull the bottom half of each species
	rankGlobally()
	removeStaleSpecies()
	rankGlobally()
	for (var s=0;s<pool.species.length;s++)
		calculateAverageFitness(pool.species[s])
	removeWeakSpecies()

	var sum = totalAverageFitness()
	var children = []
	for (var s=0;s<pool.species.length;s++) {
		var species = pool.species[s]
		var breed = Math.floor(species.averageFitness / sum * Population) - 1
		for (var i=0;i<breed;i++) children.push(breedChild(species))
	}
	cullSpecies(true) // Cull all but the top member of each species
	while (children.length + pool.species.length < Population) {
		var species = pool.species[Math.floor(Math.random()*pool.species.length)]
		children.push(breedChild(species))
	}
	for (var c=0;c<children.length;c++) addToSpecies(children[c])
	
	pool.generation++;
	
	writeFile()
}

function initializePool() {
	loadFile()
	
	if (typeof pool === "undefined") {
		if (typeof poooltho === "undefined") {
			pool = newPool();
			for (var i=0;i<Population;i++)
				addToSpecies(basicGenome())
		} else {
			pool = poooltho;
		}
	}
	
	initializeRun()
}

function clearJoypad() {
	controller = {}
	for (var b=0;b<ButtonNames.length;b++)
		controller[ButtonNames[b]] = false
	joypad.set(controller)
}

function evaluateCurrent() {
	inputs = getInputs()
	controller = evaluateNetwork(pool.currentGN.network, inputs)
	
	if (controller["Left"] && controller["Right"])
		controller["Left"] = controller["Right"] = false
	if (controller["Up"] && controller["Down"])
		controller["Up"] = controller["Down"] = false

	joypad.set(controller)
}

function initializeRun() {
	clearJoypad()
	pool.currentGN = pool.species[pool.currentSpecies].genomes[pool.currentGenome]
	generateNetwork(pool.currentGN)
	evaluateCurrent()
}

function nextGenome() {
	pool.currentGenome++;
	if (pool.currentGenome >= pool.species[pool.currentSpecies].genomes.length) {
		pool.currentGenome = 0
		pool.currentSpecies++;
		if (pool.currentSpecies >= pool.species.length) {
			newGeneration()
			pool.currentSpecies = 0
		}
	}

}

function setPut(inputs,c,val) {
	var x0 = Math.floor( (c.left - mario.left+dascale/2)/dascale ),
		y0 = Math.floor( (c.top - mario.top+dascale/2)/dascale ),
		x1 = Math.floor( (c.right - mario.left+dascale/2)/dascale ),
		y1 = Math.floor( (c.bottom - mario.top+dascale/2)/dascale );
	for (var x=x0;x<x1;x++) {
		for (var y=y0;y<y1;y++) {
			if (Math.abs(x)<=Radius && Math.abs(y)<=Radius) {
				var ind = (x+Radius)*Side+(y+Radius);
				inputs[ind] = 1; // fill vs nonfill
				inputs[ind+Inputs/2]=val; //solid vs moving
			}
		}
	}
}

function getInputs() {
	var inputs = Array.apply(null, Array(Inputs)).map(Number.prototype.valueOf,0);
	for (var i=0;i<Inputs/2;i++) inputs[i] = -1; // first half default to nonfill
	//first half is fill=(+1) vs nonfill=(-1)
	//secnd half is solid=(+1) vs moving=(-1) vs nonfill=(0)
	for (var i=0; i<characters.length;i++)
		setPut(inputs,characters[i],-1);
	for (var i=0; i<solids.length;i++)
		setPut(inputs,solids[i],1);
	return inputs;
}

function sigmoid(x) { return 2/(1+Math.exp(-4.9*x))-1; }

yshift = Radius*11
function displayGenome(genome,gui) {
	var network = genome.network
	var cells = {}
	var cell;
	var i=0;
	for (var dx=-Radius;dx<=Radius;dx++) {
		for (var dy=-Radius;dy<=Radius;dy++) {
			cell = {}
			cell.x = 50+5*dx
			cell.y = 70+5*dy
			cell.value = network.neurons[i].value
			cells[i] = cell;
			
			cell = {}
			cell.x = 50+5*dx
			cell.y = 70+5*dy+yshift
			cell.value = network.neurons[Inputs/2+i].value
			cells[Inputs/2+i] = cell;
			
			i++;
		}
	}
	gui.strokeStyle = "BLACK";
	for (var o=0;o<Outputs;o++) {
		cell = {}
		cell.x = 220
		cell.y = 30 + 8 * o
		cell.value = network.neurons[MaxNodes + o].value
		cells[MaxNodes+o] = cell
		gui.strokeText(ButtonNames[o], 223, 32+8*o)
	}
	
	for (var n in network.neurons) {
	if (network.neurons.hasOwnProperty(n)) {
		var neuron = network.neurons[n];
		cell = {}
		if (n >= Inputs && n < MaxNodes) {
			cell.x = 140
			cell.y = 40
			cell.value = neuron.value
			cells[n] = cell
		}
	}}
	
	for (var n=0;n<4;n++) {
		for (var gk=0;gk<genome.genes.length;gk++) {
			var gene=genome.genes[gk];
			if (gene.enabled) {
				var c1 = cells[gene.into]
				var c2 = cells[gene.out]
				if (gene.into >= Inputs && gene.into < MaxNodes){
					c1.x = 0.75*c1.x + 0.25*c2.x
					if (c1.x >= c2.x ) c1.x -= 40
					if (c1.x < 90 ) c1.x = 90
					if (c1.x > 220 ) c1.x = 220
					c1.y = 0.75*c1.y + 0.25*c2.y
					
				}
				if (gene.out >= Inputs && gene.out < MaxNodes) {
					c2.x = 0.25*c1.x + 0.75*c2.x
					if (c1.x >= c2.x ) c2.x += 40
					if (c2.x < 90 ) c2.x = 90
					if (c2.x > 220 ) c2.x = 220
					c2.y = 0.25*c1.y + 0.75*c2.y
				}
			}
		}
	}
	
	for (var n in cells) {
	if (cells.hasOwnProperty(n)) {
		var cell = cells[n];
		if (n >= Inputs || cell.value != 0 ) {
			gui.strokeStyle = "BLACK";
			if (cell.value < 0) {
				gui.strokeStyle = "RED";
			} else if (cell.value > 0) {
				gui.strokeStyle = "GREEN"
			}
			gui.strokeRect(cell.x-2,cell.y-2,5,5)
		}
	}}
	for (var gk=0;gk<genome.genes.length;gk++) {
		var gene = genome.genes[gk];
		if (gene.enabled) {
			var c1 = cells[gene.into]
			var c2 = cells[gene.out]
			
			var color = 0x80-Math.floor(Math.abs(sigmoid(gene.weight))*0x80)
			if (gene.weight > 0 ) 
				gui.strokeStyle="Green";
			else
				gui.strokeStyle="RED";
			gui.beginPath();
			gui.moveTo(c1.x+1, c1.y)
			gui.lineTo(c2.x-3, c2.y)
			gui.stroke();
		}
	}
	
	gui.strokeStyle = "BLACK";
	gui.strokeRect(50-Radius*5-3,70-Radius*5-3,Radius*10+6,Radius*10+6)
	gui.strokeRect(50-Radius*5-3,70-Radius*5-3+yshift,Radius*10+6,Radius*10+6)
}

function draw(){
	if (paused) return;
	var ctx = canvas.getContext("2d");
	tick()
	displayGenome(pool.currentGN,ctx);
}

calculated = false;
fitwassame = 0;
function tick() {
	pool.frame++;
	document.title = ""+pool.frame+"."+pool.generation+"."+pool.currentSpecies+"/"+pool.species.length+":"+pool.currentGenome+"/"+pool.species[pool.currentSpecies].genomes.length;
	var curFit = gamescreen.left + mario.left;
	// + data.score.amount - data.time.amount;
	if (Math.floor(pool.curFitness/dascale) === Math.floor(curFit/dascale)) {
		fitwassame++;
		if (fitwassame > 250) {
			killMario(mario,true);
			fitwassame = 0;
		}
	} else {
		fitwassame=0;
		pool.curFitness=curFit; 
	}
	
	if (mario.dying) {
		fitwassame = 0;
		if (!calculated) {
			calculated=true;
			pool.currentGN.fitness = pool.curFitness;
			if (pool.currentGN.fitness > pool.maxFitness)
				pool.maxFitness = pool.currentGN.fitness
			nextGenome();
			pool.prevGN = pool.currentGN;
			pool.currentGN = pool.species[pool.currentSpecies].genomes[pool.currentGenome]
			generateNetwork(pool.currentGN);
			writeFile();
		}
		data.lives.amount = 3;
	} else {
		if (pool.frame>10) {
			calculated = false;
			evaluateCurrent()
			pool.frame = 0;
		}
	}
}

writePool = function writePool(){
	var atag = document.createElement('a');
	atag.href = 'data:text/javascript;charset=utf-8,' + encodeURIComponent("poooltho="+storage.getItem(saveKey));
	atag.target = '_blank';
	atag.download = 'poooltho.js';
	atag.click()
}