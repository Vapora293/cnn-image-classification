<template>
  <div>
    <button @click="exportMappings">Export Mappings</button>
    <div class="pagination">
      <button @click="prevPage" :disabled="currentPage === 1">Previous</button>
      <span>Page {{ currentPage }} of {{ totalPages }}</span>
      <button @click="nextPage" :disabled="currentPage === totalPages">Next</button>
    </div>
    <div class="pagination">
      <input v-model.number="targetPage" type="number" min="1" :max="totalPages" placeholder="Enter page number" />
      <button @click="goToPage">Go to Page</button>
    </div>
    
    <table class="predictions-table" v-if="Object.keys(resultData).length > 0">
      <thead>
        <tr>
          <th>Image</th>
        </tr>
      </thead>
      <tbody>
        <div v-for="(predictions, image) in paginatedData" :key="image + '-rows'">
          <tr :key="image + '-first-row'">
            <td rowspan="2">
              <img :src="getCroppedImagePath(image)" :alt="`Cropped ${image}`" />
              <p class="small_label">{{ image }}</p>
            </td>
            <td v-for="classPredictions in predictions[0]" :key="classPredictions + '-first'">
              <prediction-image
                :imagePath="getImagePath(classPredictions)"
                :classNumber="classPredictions"
                :isSelected="mappings[image] === classPredictions"
                @select="setMapping(image, classPredictions)"
              />
            </td>
            <td rowspan="2">
              <input
                v-model="mappings[image]"
                placeholder="Enter class number"
                @input="handleCustomClass(image)"
              />
              <p>Custom class: {{ mappings[image] }}</p>
            </td>
          </tr>

          <tr :key="image + '-second-row'">
            <td v-for="classPredictions in predictions[1]" :key="classPredictions + '-second'">
              <prediction-image
                :imagePath="getImagePath(classPredictions)"
                :classNumber="classPredictions"
                :isSelected="mappings[image] === classPredictions"
                @select="setMapping(image, classPredictions)"
              />
            </td>
          </tr>
        </div>
      </tbody>
    </table>

    <div class="pagination">
      <button @click="prevPage" :disabled="currentPage === 1">Previous</button>
      <span>Page {{ currentPage }} of {{ totalPages }}</span>
      <button @click="nextPage" :disabled="currentPage === totalPages">Next</button>
    </div>
    <div class="pagination">
      <input v-model.number="targetPage" type="number" min="1" :max="totalPages" placeholder="Enter page number" />
      <button @click="goToPage">Go to Page</button>
    </div>
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
      imageData: {}, 
      resultData: {},
      currentPage: 1,
      imagesPerPage: 10,
      targetPage: 1,
      mappings: {}, 
      customClasses: {},
    };
  },
  computed: {
    totalPages() {
      return Math.ceil(Object.keys(this.resultData).length / this.imagesPerPage);
    },
    paginatedData() {
      const entriesArray = Object.entries(this.resultData); // Convert the object into an array of [key, value] pairs
      const start = (this.currentPage - 1) * this.imagesPerPage * 2;
      const end = start + this.imagesPerPage;

      const paginatedEntries = entriesArray.slice(start, end); 

      return Object.fromEntries(paginatedEntries);
    }
  },
  created() {
    axios.get('/result_full.json') 
      .then((response) => {
        this.resultData = response.data;
        this.loadMappings();
      })
      .catch((error) => {
        console.error('Error loading result.json:', error);
      });

    axios.get('/images.json')
      .then((response) => {
        this.imageData = response.data;
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
      
      if (!this.imageData['train'] || !this.imageData['train'][classNumber]) {
        return '';
      }
    
      const images = this.imageData['train'][classNumber];

      if (!images || images.length === 0) {
        return '';
      }

      const randomIndex = Math.floor(Math.random() * images.length);
      const randomImage = images[randomIndex];

      return `${basePath}${randomImage}`;
    },
    getCroppedImagePath(name) {
      const basePath = '/cropped_images/';
      return `${basePath}${name}`;

    },
    setMapping(image, classNumber) {
      this.mappings[image] = classNumber;
      this.saveMappings();
    },
    handleCustomClass(image) {
      const customClassValue = this.mappings[image];
      if (customClassValue) {
        // Directly assign the value in Vue 3
        this.mappings[image] = customClassValue;
        this.saveMappings();
      }
    },
    saveCustomClass(image) {
      this.mappings[image] = this.customClasses[image];
      this.clearSelectedImages(image); // Unselect other images
      this.saveMappings(); // Save to local storage
    },
    clearSelectedImages(image) {
      // Reset the mapping for the current image if a custom class is used
      for (const key in this.mappings) {
        if (key !== image) {
          this.mappings[key] = null; // Unselect others if needed
        }
      }
    },
    getCurrentClass(image) {
      return this.mappings[image] || 'None'; // Return 'None' if no class is mapped
    },
    loadMappings() {
        const savedMappings = localStorage.getItem('imageClassMappings');
        if (savedMappings) {
          this.mappings = JSON.parse(savedMappings);
        }
      },
    saveMappings() {
      // Step 1: Retrieve the existing object from localStorage
      const storedMappings = JSON.parse(localStorage.getItem('imageClassMappings')) || {};
      // Step 2: Iterate over the current mappings in this.mappings and update storedMappings
      Object.keys(this.mappings).forEach(image => {
        storedMappings[image] = this.mappings[image]; // Update or add the mapping
      });
      // Step 3: Save the updated storedMappings back to localStorage
      localStorage.setItem('imageClassMappings', JSON.stringify(storedMappings));
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
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage += 1;
      }
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage -= 1;
      }
    },
    goToPage() {
      if (this.targetPage >= 1 && this.targetPage <= this.totalPages) {
        this.currentPage = this.targetPage; // Set the current page to the target page
      } else {
        alert(`Please enter a valid page number between 1 and ${this.totalPages}`);
      }
    },
  },
};
</script>
<!-- .image-container {
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
</style>  -->

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


