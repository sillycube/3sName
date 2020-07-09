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
        animalWords: ["Bear" ,"Bee", "Bird", "Bug", "Cat", "Chimp", "Cow", "Dog", "Duck", "Fish", "Fox", "Hippo", "Kitten", "Lion", "Monkey", "Octopus", "Panda", "Pig", "Sheep", "Snake"],
        noOfAnimal: 5,
        extensions: ["hub", "hq", "io", "ify", "ly"],
        specialTLDs: [".ai", ".app", ".co", ".io", ".ly", ".xyz"],
        adjectives: ["Cheap","Clear","Cloud","Easy","Fast","Good","High","Insta","Open","Smart","Snap"],
        noOfAdj: 5,
        standardTLD: ".com",
    },
    mounted: function () {
        this.results = this.searchResults;
    },
    computed: {
        isEnglish: function() {

        }
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
            this.showResult = true;
            console.log("keyword = " + this.keyword);
            noOfWord = this.getNoOfWord();
            if (noOfWord == 1) {
                this.searchResults.length = 0;
                this.getAnimalResults();
                this.getExtensionResults();
                this.getAdjectives();
                this.getSpecialTLDs();
				this.getDomainAvailability();
            }
        },
        getSpecialTLDs: function() { // rule: 1 word + special TLDs
            var ruleResults = [];
            for (let i = 0; i < this.specialTLDs.length; i++)
                ruleResults.push({domain: this.keyword + this.specialTLDs[i], isBookmarked: false})
            this.searchResults.push({rule: "Special TLD", ruleResults: ruleResults})
        },
        getAdjectives: function() { // rule: adjective + 1 word
            var randomAdjectives = this.shuffle(this.adjectives);
            var ruleResults = [];
            for (let i = 0; i < this.noOfAdj; i++)
                ruleResults.push({domain: randomAdjectives[i] + this.keyword + this.standardTLD, isBookmarked: false})
            this.searchResults.push({rule: "Adjective", ruleResults: ruleResults})
        },
        getExtensionResults: function() { // rule: 1 word + extension
            var ruleResults = [];
            for (let i = 0; i < this.extensions.length; i++)
                ruleResults.push({domain: this.keyword + this.extensions[i] + this.standardTLD, isBookmarked: false})
            this.searchResults.push({rule: "Extension", ruleResults: ruleResults})
        },
        getAnimalResults: function() { // rule: 1 word + animal
            var randomAnimals = this.shuffle(this.animalWords);
            var ruleResults = [];
            for (let i = 0; i < this.noOfAnimal; i++)
                ruleResults.push({domain: this.keyword + randomAnimals[i] + this.standardTLD, isBookmarked: false})
            this.searchResults.push({rule: "Animal", ruleResults: ruleResults})
        },
        saveResult: function(result) { // bookmark a search result
            if (!result.isBookmarked) {
                this.bookmarkResults.push({domain: result.domain, isAvailable: result.isAvailable, standardName: result.isStandardName,isBookmarked: true});
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
			
			axios
				.get(url)
				.then(function (response) {
					console.log(response);
					var domains = response.data.domains;
					var i = 0;
					for (searchResult of vm.searchResults)
						for (ruleResult of searchResult.ruleResults) {
							// ruleResult.isAvailable = domains[i].available;
							Vue.set(ruleResult, 'isAvailable', domains[i].available);
							Vue.set(ruleResult, 'isStandardName', domains[i].standardName);
							i++;							
						}
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
