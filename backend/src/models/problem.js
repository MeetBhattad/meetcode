const mongoose = require('mongoose');
const {Schema} = mongoose;

const problemSchema = new Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    difficulty:{
        type:String,
        enum:['easy','medium','hard'],
        required:true,
    },
      tags: {
        type: String,
        enum: [
        'array', 'string', 'hashMap', 'twoPointers', 'slidingWindow', 
        'stack', 'binarySearch', 'linkedList', 'tree', 'trie', 
        'heap', 'backtracking', 'graph', 'dp', 'greedy', 
        'intervals', 'math', 'bitManipulation'
    ],
    required: true
    },
    visibleTestCases:[
        {
            input:{
                type:String,
                required:true,
            },
            output:{
                type:String,
                required:true,
            },
            explanation:{
                type:String,
                required:true
            }
        }
    ],

    hiddenTestCases:[
        {
            input:{
                type:String,
                required:true,
            },
            output:{
                type:String,
                required:true,
            }
        }
    ],

    startCode: [
        {
            language:{
                type:String,
                required:true,
            },
            initialCode:{
                type:String,
                required:true
            }
        }
    ],

    referenceSolution:[
        {
            language:{
                type:String,
                required:true,
            },
            completeCode:{
                type:String,
                required:true
            }
        }
    ],

    testHarness: [
  {
    language: {
      type: String,
      required: true,
    },
    harnessCode: {
      type: String,
      required: true,
    },
  },
],

    problemCreator:{
        type: Schema.Types.ObjectId,
        ref:'user',
        required:true
    },
    companies: [
  {
    name: { type: String, required: true },
    frequency: { type: Number, default: 0 },
    timeframe: { type: String, enum: ['30d', '3m', '6m', 'older', 'all'], default: 'all' },
    acceptanceRate: { type: Number, default: 0 },
  },
],
})


const Problem = mongoose.model('problem',problemSchema);
problemSchema.index({ 'companies.name': 1 });

module.exports = Problem;