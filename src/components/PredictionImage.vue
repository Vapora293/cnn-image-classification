<template>
    <div class="prediction-image" :class="{ selected: isSelected }" @click="handleClick">
      <img :src="imagePath" :alt="`Class ${classNumber}`" loading="lazy" />
      <div class="class-number">{{ classNumber }}</div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      imagePath: {
        type: String,
        required: true,
      },
      classNumber: {
        type: Number,
        required: true,
      },
      isSelected: {
        type: Boolean,
        default: false,
      },
    },
    methods: {
      handleClick() {
        this.$emit('select', this.classNumber);
      },
    },
  };
  </script>
  
  <style scoped>
  .prediction-image {
    display: inline-block;
    margin: 10px;
    cursor: pointer;
    border: 10px solid transparent;
  }
  
  .prediction-image.selected {
    border: 10px solid red !important; /* Red border for selected images */
  }
  
  .class-number {
    text-align: center;
  }
  </style>
  