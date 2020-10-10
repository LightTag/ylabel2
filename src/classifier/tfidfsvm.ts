import { SVM } from 'libsvm-ts';
import {example} from "../data_clients/dbclient";
import TFIDFTransformer from "./tfidf";
import trainSVM from "./trainSVM";
class TFIDFSVM{
    svm : SVM
    tfidfTransformer : TFIDFTransformer
    labelsNamesToIds :Record<string, number>
    labelIdsToName : Record<number, string>
    private  constructor( svm:SVM,tfidfTransformer:TFIDFTransformer,labelsNamesToIds :Record<string, number>,labelIdsToName : Record<number, string>) {
        this.svm =svm
        this.tfidfTransformer = tfidfTransformer
        this.labelsNamesToIds =labelsNamesToIds
        this.labelIdsToName = labelIdsToName
    }

    static async  make(examples:Required<example>[],exampleLabels:Record<string, string>) :Promise<TFIDFSVM> {
        const {labelsNamesToIds, labelIdsToName, exampleLabelIds} = TFIDFSVM.prepareLabelIds(exampleLabels);
        const transformer  =new TFIDFTransformer()
        const trainingTFIDf  = transformer.fitTransform(examples);
        const svm = await trainSVM(trainingTFIDf,exampleLabelIds,transformer.df)
        const model = new TFIDFSVM(svm,transformer,labelsNamesToIds,labelIdsToName)
        return model


    }

    private static prepareLabelIds(exampleLabels: Record<string, string>) {
        const labelNameSet = new Set<string>()
        const labelsNamesToIds: Record<string, number> = {}
        const labelIdsToName: Record<number, string> = {}
        const exampleLabelIds: Record<string, number> = {}
        Object.values(exampleLabels).forEach(labelNameSet.add);
        Array.from(labelNameSet).forEach((labelName, labelId) => {
            labelsNamesToIds[labelName] = labelId
            labelIdsToName[labelId] = labelName

        })
        Object.entries(exampleLabels).forEach(([exampleId, labelName]) => {
            exampleLabelIds[exampleId] = labelsNamesToIds[labelName]
        })
        return {labelsNamesToIds, labelIdsToName, exampleLabelIds};
    }
}