let Company = mongoose.model("Company", {
    company: {
      type: String,
      required: true
    },
    alias: {
      type: Array,
      required: true 
    },
    category: {
      type: Array,
      required: true
    },
    greenscore: {
      type: String
    },
    dow: {
      type: String
    },
    sustainable: {
      type: String
    }
  })
  
  module.exports = {Company};