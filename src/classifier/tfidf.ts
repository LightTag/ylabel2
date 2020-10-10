import {example} from "../data_clients/dbclient";
export class Counter extends Map {
    get(key :string){
        if(!this.has(key)){
            return 0
        }
        return super.get(key)
    }
    increment(key :string){
        const val = this.get(key)
        this.set(key,val+1)
    }
}
const splitter =/[\b\s-.,!&:]+(?!$)/;
export type TFIDFT = Record<string, Record<string, number>>

function doExample(example:Required<example>){
    const tf = new Counter()
    const df = new Set<string>()

    example.content.split(splitter).forEach(word=>{
        if (!word.match(/[\d]/)){
            tf.increment(word)
            df.add(word)
        }

    })
    return {df,tf}
}
function calculateTFIDF (examples:Required<example>[]){
    const tf : Record<string,Counter> ={};
    const df  = new Counter()
    examples.forEach(example=>{
        //Calculate the df
        const ex_res = doExample(example);
        ex_res.df.forEach(word=>{
            df.increment(word)
        })
        tf[example.example_id] = ex_res.tf
    })
    const tfIdf : TFIDFT = {}
    examples.forEach(example=> {
        tfIdf[example.example_id] ={}
        df.forEach((value, word) => {
            tfIdf[example.example_id][word] = Math.log1p(tf[example.example_id].get(word) /df.get(word))
        })
    })
    return {tfIdf,df}
}

class TFIDFTransformer {
    df :Counter
    constructor() {
        this.df = new Counter()
    }
    fitTransform(examples:Required<example>[]){
        const {tfIdf,df} =calculateTFIDF(examples)
        this.df =df
        return tfIdf
    }
    transform(examples:Required<example>[]){
        const tfIdf : TFIDFT = {}
        const tf :Record<string, Counter> = {}

        examples.forEach(example=>{
            //Calculate the df
            const ex_res = doExample(example);
            tf[example.example_id] = ex_res.tf
        })
        examples.forEach(example=> {
            tfIdf[example.example_id] ={}
            this.df.forEach((value, word) => {
                tfIdf[example.example_id][word] = Math.log1p(tf[example.example_id].get(word) /this.df.get(word))
            })
        })
    }
}

export default TFIDFTransformer