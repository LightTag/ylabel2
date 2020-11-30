# YLabel2
YLabel is a tool for document categorization with search and ML that runs in the browser.
 
## Goals

### Fast Document Categorization
YLabel's primary goal is to make document categorization fast and easy for individual contributors (as opposed to a team)
Particularly we want:
* **0 Setup** The tool should "just work" with no software installation, server configuration or engineer involvement.
* **Search** Users should be able to quickly apply their domain knoweledge by searching documents
* **Augmentation** YLabel aims to augment the users categorization efforts through statistics and AI
* **Automation** The user should be able to partially categorize a set of documents and get back predictions on the rest 
* **Trust** The user should receive enough information about the models performance to decide if and when to trust it's predictions
* **Private** The users data should never leave their server and they should be able to use all of YLabel in an offline mode 

### UX & Technology Experimentation
YLabel is a UX and tech experiment. Our 0-setup and privacy goals mean that their is no central server or service, and that YLabel works entirely in the browser. YLabel is thus an experiment that asks " How much can we do for the user within the browser ?"

Another motivation for running purely in the server is the **elimination of operational complexity**. Running "AI" for users on a server
demands operational complexity, and thus pulls resources away from product innovation. We hope that running YLabel purely in the browser
will allow faster experimentation with user facing features by eliminating operational complexity.  

This is an open ended experiment, we have a set of questions we'd like to answert and welcome the community to add questions 
(and implemetations). Some of the things we'd like to learn about are: 

* **Persistance + Analytics** We can store data in IndexdDB: Would is the best way to model a categorization project such that
interacting with and gaining trust in an "AI" component is feasible. In other ways, how do you do OLAP with a document store. 
* **"Old School NLP"** What "old school" AI/NLP techniques can we use to give the user a productivity boost very fast. For example,
[significant terms](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-significantterms-aggregation.html),
* **"Modern NLP"** Is running deep learning in the browser with tf.js feasible for most users ? Is it effective for many user cases ?
How do we balance a typical users computing power with the resource intensive nature of modern NLP  ? 


 
## Core Technologies We Want To Learn About
As a platform for experimentation, YLabel aims to interact with the following technologies in interesting ways: 

* **Web Workers** We can use webworkers to perform "heavy" calculations on the client without interrupting the user. 
What work belongs in Web Workers and what are good software development practices / design patterns when using them ?
* **Web Assembly** Web assembly offers us 1) faster execution of complex calulations 2) access to an ecosystem of
components beyond the npm ecosystem. For example, [tantivy](https://github.com/tantivy-search/tantivy) is a search engine written in Rust
that we'd like to use as a WASM module. Or, [tf.js](https://blog.tensorflow.org/2020/09/supercharging-tensorflowjs-webassembly.html)
recently released a backend that leverages SIMD and native threads for faster calcuation.
* **React With IndexdDB** The React ecosystem makes have use of reference equality to keep apps performant. Our reliance on Web Workers and Indexdb makes that harder (because objects are copied). How do we maintain React's performance when reference stability is no longer a valid assumption ? 
   



## Contributing

Issues, Pull requests and suggestions are welcome, though it's still early days and we're working on making it easy to dive in. Feedback, complaints and requests are welcome! 


## Inspiration

### Papers and Previous Work

YLabel is inspired by many papers and previous annotation tools. The list is long but some we'd like to mention

* [LightTag](https://www.lighttag.io/) Our own commercial annotation tool 
* [Prodi.gy](https://prodi.gy/) from [Explosion.ai](https://explosion.ai/) is a fantastic tool, and demonstrated the power of
binary decision making as a UX trick to radically boost annotator productivity
* [Why Label When You Can Search ](http://pages.stern.nyu.edu/~fprovost/Papers/guidedlearning-kdd2010.pdf) by ... which made
a strong academic case for the usefulness of search in the categorization process. It's also the projects namesake. 
* [Active Learning by Labeling Features](https://www.aclweb.org/anthology/D09-1009.pdf) "Preliminary experiments suggest that novel interfaces which intelligently solicit labels on multiple features facilitate more efficient annotation.
"
* [Active Learning with Real Annotation Costs](http://burrsettles.com/pub/settles.nips08ws.pdf) "In domains where labeling costs may vary,                                                                                                  a reduction in the number of labeled instances does not guarantee a reduction in cost"

### Open Source Libraries
* [Dexie](https://dexie.org/) is a wonderfull interface over IndexdDB that makes it easy to use
* [React Query](https://github.com/tannerlinsley/react-query) Makes managing and caching the async calls to IndexDB easy
* [libsvm-ts](https://github.com/machinelearnjs/libsvm-ts) A typescript interface to a WASM compilation of libSVM. 
* [tf.js](https://www.tensorflow.org/js) The JS implementation of Tensorflow that makes neural nets in the browser easy.


