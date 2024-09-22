<template>
  <div>
    <button @click="exportMappings">Export Mappings</button>
    <table class="predictions-table" v-if="Object.keys(resultData).length > 0">
      <thead>
        <tr>
          <th>Image</th>
          <th v-for="n in 5" :key="n">Prediction {{ n }}</th>
          <th>Custom class</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(predictions, image) in resultData" :key="image">
          <td>
            <img :src="getCroppedImagePath(image)" :alt="`Cropped ${image}`" />
          </td>

          <td v-for="classPredictions in predictions[0]" :key="classPredictions">
          <prediction-image
            :imagePath="getImagePath(classPredictions)"
            :classNumber="classPredictions"
            :isSelected="mappings[image] === classPredictions"
            @select="setMapping(image, classPredictions)"
          />
          </td>
          <td>
            <input
              v-model="customClasses[image]"
              placeholder="Enter class number"
              @input="saveCustomClass(image)"
            />
          </td>
        </tr>
        
        <tr v-for="(predictions, image) in resultData" :key="image + '-second-row'">
          <td><p class="small_label">{{ image }}</p></td>
          <td v-for="classPredictions in predictions[1]" :key="classPredictions">
          <prediction-image
            :imagePath="getImagePath(classPredictions)"
            :classNumber="classPredictions"
            :isSelected="mappings[image] === classPredictions"
            @select="setMapping(image, classPredictions)"
          />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import axios from 'axios';
import PredictionImage from './PredictionImage.vue';

export default {
  components: {
    PredictionImage,
  },
  data() {
    return {
      imageData: {}, // Make sure it's declared here.
      resultData: {},
      mappings: {}, // The mapping to store user selections.
      customClasses: {},
    };
  },
  created() {
  axios.get('/result.json')  // '/public' folder serves static assets directly
    .then((response) => {
      this.resultData = response.data;
      this.loadMappings();
    })
    .catch((error) => {
      console.error('Error loading result.json:', error);
    });
   // Load images.json containing class images
  axios.get('/images.json')
    .then((response) => {
      this.imageData = response.data; // Load image data (train/eval)
    })
    .catch((error) => {
      console.error('Error loading images.json:', error);
    });
  const savedMappings = localStorage.getItem('imageClassMappings');
  if (savedMappings) {
    this.mappings = JSON.parse(savedMappings);
  }
  },
  methods: {
    getImagePath(classNumber) {
      const basePath = '/ts_7/train/';
      
      // Check if the class number exists in the imageData
      if (!this.imageData['train'] || !this.imageData['train'][classNumber]) {
        console.error(`No images found for class number: ${classNumber}`);
        return '/path_to_placeholder_image.png'; // Optional: Placeholder image if class doesn't exist
      }
      
      const images = this.imageData['train'][classNumber];

      if (!images || images.length === 0) {
        console.error(`No images available for class number: ${classNumber}`);
        return '/path_to_placeholder_image.png'; // Optional: Placeholder image
      }

      const randomIndex = Math.floor(Math.random() * images.length);
      const randomImage = images[randomIndex];

      return `${basePath}${randomImage}`;
    },
    getCroppedImagePath(name) {
      const basePath = '/cropped_images/';
      return `${basePath}${name}`;

    },
    // Method to save the mapping when a user clicks "Set as Correct"
    setMapping(image, classNumber) {
      // this.mappings = {
      //   ...this.mappings,
      //   [image]: classNumber,
      // };
      this.mappings[image] = classNumber; // Map the image to the selected class
      this.saveMappings();
    },
    handleCustomClass(image) {
      if (this.customClass) {
        // Unselect any selected images
        this.mappings[image] = this.customClass; // Store custom class
        this.clearSelectedImages(image); // Clear selected images
        this.saveMappings();
      }
    },
    clearSelectedImages(image) {
      // Reset the mapping for the current image if a custom class is used
      for (const key in this.mappings) {
        if (key !== image) {
          this.mappings[key] = null; // Unselect others if needed
        }
      }
    },
    loadMappings() {
        const savedMappings = localStorage.getItem('imageClassMappings');
        if (savedMappings) {
          this.mappings = JSON.parse(savedMappings);
        }
      },
    saveMappings() {
      localStorage.setItem('imageClassMappings', JSON.stringify(this.mappings));
    },
    exportMappings() {
      const blob = new Blob([JSON.stringify(this.mappings, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'mappings.json';
      a.click();
      URL.revokeObjectURL(url);
    },
    saveCustomClass(image) {
      if (this.customClasses[image]) {
        // Store custom class in mappings and save it
        this.mappings[image] = this.customClasses[image];
        this.clearSelectedImages(image); // Unselect other images
        this.saveMappings(); // Save to local storage
      }
  },
  },
};
</script>
.image-container {
  margin-bottom: 20px;
}

.predictions {
  display: flex;
  flex-direction: column;
}

.row {
  display: flex;
  justify-content: space-between; /* Or use space-around */
}

.column {
  flex: 1; /* This makes each column take up equal space */
  text-align: center;
}

img {
  max-width: 100%; /* Ensures images fit within their columns */
  height: auto; /* Maintains aspect ratio */
}
</style> -->

<style>
.predictions-table {
  width: 100%;
  border-collapse: collapse;
}

.predictions-table th,
.predictions-table td {
  border: 1px solid #ddd;
  padding: 8px;
}

.predictions-table img {
  max-width: 100px; /* Adjust size as needed */
  cursor: pointer;
  border: 10px solid transparent;
}

.predictions-table th {
  background-color: #f2f2f2;
  text-align: center;
}

/* Add a red border to selected images */
.selected {
  border: 10px solid red !important;

}
.small_label {
  font-size: 0.5em;
}
</style>


