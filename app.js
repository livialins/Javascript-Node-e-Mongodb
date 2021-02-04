//Carregando Módulos
const Handlebars = require('handlebars');
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access'); 

    const express = require('express')
    const bodyParser= require('body-parser')
    const exphbs = require('express-handlebars');
    const app = express() 
    const path = require("path")                            //essa const recebe a funcao que vem do express.
    const admin = require('./routes/admin')           //é necessario criar essa constante para informar ao express a pasta em que as rotas foram criadas.(./pasta/nomedoarquivo)
    const mongoose = require('mongoose')
    const session = require("express-session")
    const flash = require("connect-flash");            //flash é um tipo de sessão que só aparece uma vez: tipo msg de "criada com sucesso"aparece e quando recarrega a pagina ela some.
    require("./models/Postagem")
    const Postagem = mongoose.model("postagens")
    require("./models/Categoria")
    const Categoria = mongoose.model("categorias")
    const usuarios = require("./routes/usuario")
    const passport = require("passport");
    require("./config/auth")(passport)

    //Configuracoes
        //sessáo
        app.use(session({
            secret: "cursodenode",
            resave: true,
            saveUninitialized: true
        }));
        app.use(passport.initialize())
        app.use(passport.session())
        app.use(flash());                                     //É importante que fique nessa ordem, primeiro a sessao , depois  o passport e por ultimo o flash.
        
        //Middleware //aqui sao declaradas as variaveis globais
        app.use((req, res, next) => {
            res.locals.success_msg = req.flash('success_msg');                           //esse objeto locals serve para guardar variaveis globais
            res.locals.error_msg = req.flash('error_msg');
            next();
            res.locals.error = req.flash("error")
            res.locals.user = req.user || null;                                      // a variavel user vai armazenar os dados do usuario autenticado e caso nao seja passado nenhum dado ira retornar o valor null.
        });
        //BodyParser
            app.use(bodyParser.urlencoded({extended: true}))
            app.use(bodyParser.json())
        //Handlebars
        const hbs = exphbs.create({
            defaultLayout: 'main', 
            extname: 'handlebars',
            handlebars: allowInsecurePrototypeAccess(Handlebars)
          });
      
      
          app.engine('handlebars', hbs.engine); 
          app.set('view engine', 'handlebars');
          app.set('views', 'views');
      
        //Mongoose
            mongoose.Promise = global.Promise;                   //comando para evitar erros
            mongoose.connect("mongodb://localhost/blogapp", {useNewUrlParser: true}).then(() =>{
            console.log("Conectado com sucesso!")
        }).catch((err) =>{
            console.log("Erro ao conectar: "+err)
        })

        //Public(pasta de arquivos estaticos-ss-js-img)
        app.use(express.static(path.join(__dirname, "public")))
    
    //Rotas

    app.get('/', (req,res) => {
        Postagem.find().lean().populate("categoria").sort({data:"desc"}).then((postagens) =>{
            res.render("index",{postagens: postagens})
        }).catch((err) =>{
            req.flash('error_msg','Houve um erro interno')
            res.redirect("/404")
        })
        
    })

    app.get("/postagem/:slug", (req,res) =>{
        Postagem.findOne({slug: req.params.slug}).then((postagem) =>{
            if(postagem){
                res.render("postagem/index" , {postagem: postagem})
            }else{
                req.flash("error_msg", "Esta postagem não existe")
                res.redirect("/")
            }
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno")
            res.redirect("/")
        })

    })
    
    app.get("/categorias" , (req,res) => {
        Categoria.find().lean().then((categorias) => {
            res.render("categorias/index", {categorias: categorias})
        }).catch((err) => {
            req.flash("error_msg", " Houve um erro interno ao listar as categorias")
            res.redirect("/")
        })
    })

    app.get("/categorias/:slug",(req,res) => {
        Categoria.findOne({slug: req.params.slug}).lean().then((categoria) => {
            if(categoria){

                Postagem.find({categoria: categoria._id}).lean().then((postagens) => {

                    res.render("categorias/postagens", {postagens: postagens, categoria: categoria})
                
                }).catch((err) => {
                    req.flash("error_msg", "Houve um erro ao listar os posts!")
                    res.redirect("/")
                })
            
            }else{
                req.flash("error_msg", "Esta categoria não existe!")
                    res.redirect("/")
            }
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno ao carregar a página desta categoria")
            res.redirect("/")

        })
    })
     
    app.get("/404", (req,res) =>{
        res.send("Erro 404!")
    })

    app.get("/posts", (req,res)=>{
        res.send("Lista posts")
    })

    app.use('/admin', admin)                          //Quando criamos um arquivo de rotas separado, eles recebem um prefico para serem acessados, nesse caso o prefixo é o "/admin"
    app.use("/usuarios", usuarios)

    //Outros
    const PORT = process.env.PORT || 8081
    app.listen(PORT, () => {
        console.log("Servidor Rodando!")
    })