const mongoose = require("mongoose")
const Schema = mongoose.Schema;

const Postagem = new Schema({
    titulo:{
        type: String,
        required: true
    },
    slug:{
        type: String,
        required: true
    },
    descricao:{
        type: String,
        required: true
    },
    conteudo:{
        type: String,
        required: true
    },
    categoria:{                                         //esse campo categoria vai vincular uma postagem a essa categoria.
        type: Schema.Types.ObjectId,                    // para fazer esse vinculo usamos esse parametro escrito nessa linha em que o objetoid faz referencia a essa postagem, ou seja, elas sao ligadas pelo ID.
        ref:"categorias",                               // essa ref sera o nome do model que eu vou fazer o link, no caso categorias.
        required:true
     },
     data:{
         type: Date,
         default: Date.now()
     }
})

mongoose.model("postagens", Postagem)                    // depois de criado nós chamamos o mongoose("definimos um nome p a collection", que vai ser feita com base no nosso nome postagens)