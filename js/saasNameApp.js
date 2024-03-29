Vue.filter('dollar', function (value) {
  if (!value) return ''
  return '$' + value;
})

Vue.directive('focus', {
    inserted: function (el) {
        el.focus()
    }
})

var vm =  new Vue({
    el:"#app",
    data: {
        keyword: '',
        searchResults: [ // [{rule: "animal", ruleResults: []}, {...}]
            // { id: 1, domain: 'abc.com', isAvailable: 'Y', price: '$8.8', isBookmarked: false},
            // { id: 2, domain: 'xyz.com', isAvailable: 'Y', price: '$12.8', isBookmarked: false},
        ],
        results: [],
        bookmarkResults: [],
        type: 'search', // viewing search or bookmark
        showResult: false,
        animalWords: ["Ant", "Ape", "Bat", "Bear" ,"Bee", "Bird", "Bug", "Cat", "Chimp", "Cow", "Crab", "Dog", "Dragon", "Duck", "Eagle", "Fish", "Fox", "Frog", "Goat", "Hamster", "Hippo", "Horse", "Joey", "Kiwi", "Kitten", "Lion", "Monkey", "Mouse", "Octopus", "Owl", "Panda", "Pig", "Rat", "Rabbit", "Shark", "Sheep", "Snail", "Snake", "Spider", "Squid", "Tiger", "Toad", "Turtle", "Whale", "Wolf", "Worm", "Yak", "Zebra"],
        noOfAnimal: 10,
        extensions: ["hub", "hq", "io", "ify", "ly", "stack"],
        specialTLDs: [".com", ".ai", ".app", ".co", ".io", ".xyz", ".ly"],
        adjectives: ["Air","Big","Cheap","Clear","Cloud","Easy","Fast","Fresh","Good","Great","High","Insta","Low","Lucky","Open","Power","Quick","Rapid","Re","Simple","Smart","Small","Snap","Super", "Un"],
        noOfAdj: 10,
		physicsTerms: ['AbsoluteZero', 'Alpha','Ampere','Amplifier','Anion','Antimatter', 'Atmosphere','Beta', 'Carbon','Cathode','Conductor','Cosmic', 'Constant','Density','Decay','Dimension', 'Diode','Duality','Electrode','Electron','Element','Entropy','Fission','Fluid','Friction','Fuse','Fusion', 'Forces','Galaxy', 'Galaxies', 'Galileo','Gamma', 'Gradient','Gravity', 'Geodesic', 'Harmonic','Helix', 'Hertz','Horizon','Hubble','Hydrostatic','Hyperon','Ion','Inductive','Inertia','Interference','Kinetic','Liquid','Magnetic','Massive','Matter', 'Microwave', 'Molecules','Momentum','Motion','Neutrino','Neutron', 'Nuclear', 'Nucleus','Ohm', 'Particle', 'Plasma', 'Polymer','Positron','Principle', 'Propagation','Photon','Proton', 'Pulsar','Quark','Quantum','Quasar', 'Radiation', 'Radioactive', 'Redshift','Reflection','Refraction','Relativity', 'Resistance','Ripple','Spectrum','Superfluid','Supernovas','SuperString', 'Theory','Thermostat','Tension','Transformer','Watt','Wormhole','Ultraviolet', 'Universe','Vacuum','Velocity','Volt','Xray'],
		noOfPhysics: 10,
        standardTLD: ".com",
		domainPrices: [],
		standardTLDPrice: '',
		toggleAllNames: true,
    },
	created: function () {	
		this.getDomainPrices();
	},
    mounted: function () {
        this.results = this.searchResults;
    },
    computed: {
    },
    methods: {
		isValidDomain: function() {
			var regex = /^[a-zA-Z0-9-]+$/;
			return regex.test(this.keyword);
		},
        isSelected: function(type) {
            return this.type == type;
        },
        findName: function() {
			if (!this.keyword) {
				alert("Please input a word!");
				return;
			}
			if (!this.isValidDomain()) {
				alert("A domain can only contain letters, numbers and hyphen");
				return;
			}
			this.toggleResult('search');
            this.showResult = true;
			this.toggleAllNames = true;
            console.log("keyword = " + this.keyword);
            noOfWord = this.getNoOfWord();
            if (noOfWord == 1) {
                this.searchResults.length = 0;
                this.getAnimalResults();
                this.getExtensionResults();
                this.getAdjectives();
                this.getSpecialTLDs();
				this.getPhysicsTerms();
				this.getDomainAvailability();
            }
        },
		getPhysicsTerms: function() {
			var randomPhysics = this.shuffle(this.physicsTerms);
            var ruleResults = [];
            for (let i = 0; i < this.noOfPhysics; i++)
                ruleResults.push({domain: this.keyword + randomPhysics[i] + this.standardTLD, price: this.standardTLDPrice, isBookmarked: false}) // assume standard price
            this.searchResults.push({rule: "Physics Terms", ruleResults: ruleResults})
		},
        getSpecialTLDs: function() { // rule: 1 word + special TLDs
            var ruleResults = [];
            for (let i = 0; i < this.specialTLDs.length; i++)
				if (i != this.specialTLDs.length - 1)
					ruleResults.push({domain: this.keyword + this.specialTLDs[i], price: this.domainPrices[i].price, isBookmarked: false})
				else // ly tld is not supported by namecheap
					ruleResults.push({domain: this.keyword + this.specialTLDs[i], isBookmarked: false})
            this.searchResults.push({rule: "Special TLD", ruleResults: ruleResults})
        },
        getAdjectives: function() { // rule: adjective + 1 word
            var randomAdjectives = this.shuffle(this.adjectives);
            var ruleResults = [];
            for (let i = 0; i < this.noOfAdj; i++)
                ruleResults.push({domain: randomAdjectives[i] + this.keyword + this.standardTLD, price: this.standardTLDPrice, isBookmarked: false}) // assume standard price
            this.searchResults.push({rule: "Adjective", ruleResults: ruleResults})
        },
        getExtensionResults: function() { // rule: 1 word + extension
            var ruleResults = [];
            for (let i = 0; i < this.extensions.length; i++)
                ruleResults.push({domain: this.keyword + this.extensions[i] + this.standardTLD, price: this.standardTLDPrice, isBookmarked: false})
            this.searchResults.push({rule: "Extension", ruleResults: ruleResults})
        },
        getAnimalResults: function() { // rule: 1 word + animal
            var randomAnimals = this.shuffle(this.animalWords);
            var ruleResults = [];
            for (let i = 0; i < this.noOfAnimal; i++)
                ruleResults.push({domain: this.keyword + randomAnimals[i] + this.standardTLD, price: this.standardTLDPrice, isBookmarked: false})
            this.searchResults.push({rule: "Animal", ruleResults: ruleResults})
        },
        saveResult: function(result) { // bookmark a search result
            if (!result.isBookmarked) {
				console.log(result);
                this.bookmarkResults.push({domain: result.domain, isAvailable: result.isAvailable, isStandardName: result.isStandardName, price: result.price,isBookmarked: true});
                result.isBookmarked = true;
            }
        },
        removeResult: function(domain, index) { // remove a result in the bookmark list
            this.bookmarkResults.splice(index, 1);
            this.unsaveSearchResult(domain);
        },
        unsaveSearchResult: function(domain) {
            // for (let i=0; i<this.searchResults.length; i++)
            for (searchResult of this.searchResults)
                for (ruleResult of searchResult.ruleResults)
                    if (ruleResult.domain == domain) {
                        ruleResult.isBookmarked = false;
                        return;
                    }
        },
		getDomainAvailability: function() { // get domain availability from namecheap api
			var domainsStr = this.getDomainsStrFromResult();
			var vm = this;
			var url;
			if (location.hostname.includes('3sname.com'))
				url = 'https://api.3sname.com/apis/domains/' + domainsStr + '/';
			else // dev
				url = 'https://dev.3sname.com/apis/domains/' + domainsStr + '/';
			
			axios
				.get(url)
				.then(function (response) {
					console.log(response);
					var domains = response.data.domains;
					var i = 0;
					for (searchResult of vm.searchResults)
						for (ruleResult of searchResult.ruleResults) {
							// ruleResult.isAvailable = domains[i].available;
							var isStandardName = domains[i].standardName;
							var isAvailable = domains[i].available;
							var rule = ruleResult.rule;
							Vue.set(ruleResult, 'isAvailable', isAvailable);							
							Vue.set(ruleResult, 'isStandardName', isStandardName);	
							Vue.set(ruleResult, 'isShow', isAvailable == 'Y');	
							if (isAvailable == 'Y' && isStandardName == 'N') // premium price
								Vue.set(ruleResult, 'price', parseFloat(domains[i].premiumRegistrationPrice).toFixed(2));
							else if (isAvailable == 'N' || isStandardName != 'Y') // remove default standard price if not available or not standard name
								Vue.set(ruleResult, 'price', '');
							 
							i++;							
						}
				})
				.catch(function (error) {
					console.log(error);
				})
		},
		getDomainPrices: function() { // get domainPrices from server		
			var url;
			var vm = this;
			if (location.hostname.includes('3sname.com'))
				url = 'https://api.3sname.com/apis/domainPrices/';
			else // dev
				url = 'https://dev.3sname.com/apis/domainPrices/';
				
			axios
				.get(url)
				.then(function (response) {
					console.log(response);
					vm.domainPrices = response.data.domainPrices;
					vm.standardTLDPrice	= vm.domainPrices[0].price;				
				})
				.catch(function (error) {
					console.log(error);
				})
		},
		getDomainsStrFromResult: function() { // merge the domain list into a string separated by comma
			var domains = []
			for (searchResult of this.searchResults)
                for (ruleResult of searchResult.ruleResults)
					domains.push(ruleResult.domain);
			return domains.toString();
		},
		showAllNames: function() {
			for (searchResult of this.searchResults)
                for (ruleResult of searchResult.ruleResults)
					Vue.set(ruleResult, 'isShow', true);	
			this.toggleAllNames = false;
			// console.log('finish show names');
		},
		hideUsedNames: function() {
			for (searchResult of this.searchResults)
                for (ruleResult of searchResult.ruleResults)
					Vue.set(ruleResult, 'isShow', ruleResult.isAvailable == 'Y');
			this.toggleAllNames = true;
		},
        getNoOfWord: function() {
            return this.keyword.split(' ').length;
        },
        toggleResult: function(type) {
            this.type = type;
            this.results = (type == 'search') ? this.searchResults : this.bookmarkResults;
        },
        shuffle: function(array) { // shuffle (random reorder) with FisherYates algo
          let i = array.length;
          while (i--) {
            const ri = Math.floor(Math.random() * (i + 1));
            [array[i], array[ri]] = [array[ri], array[i]];
          }
          return array;
        }
    }
})
