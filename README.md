# Mushroom Field Notes

A locally generated field guide built from your own mushroom photographs, enriched with identifications from Google Gemini 3. Features interactive location mapping with Google Maps integration, AI-generated field guide cards, and detailed observation tracking.

## Features

- **AI-Powered Identification**: Uses Gemini 3 Pro to identify and categorize mushrooms from your photos
- **AI-Generated Field Guide Cards**: Beautiful, informative cards created by Gemini 3 Pro Image Preview
- **Batch Processing**: Process multiple images sequentially with real-time progress updates
- **Location Tracking**: Automatic GPS extraction from EXIF data with reverse geocoding
- **Interactive Maps**: Google Maps integration for exploring and selecting locations
- **Detail Modal**: Comprehensive view of all mushroom details including photos, info cards, location, weather, and identification features
- **Reprocess Functionality**: Re-analyze any observation to get updated identifications
- **Weather Integration**: Automatic weather data fetching based on location and observation time
- **Rich Data**: Includes scientific names, edibility status, key features, ecological roles, habitat notes, and more
- **Beautiful UI**: Field guide aesthetic with responsive design and smooth animations

## Setup

### Prerequisites

- Node.js 18+ and npm
- Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))
- Google Maps API key ([Get one here](https://console.cloud.google.com/google/maps-apis)) - Required for Maps JavaScript API and Places API

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   
   Create a `.env` file in the parent directory (`/Users/tscheidt/mushroom/.env`) with:
   ```bash
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
   
   Create a `.env.local` file in the `web` directory with:
   ```bash
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
   ```

3. **Add your mushroom photos:**
   - Place your images in `public/images/`
   - Supported formats: `.jpg`, `.jpeg`, `.png`, `.webp`

4. **Add your mushroom photos:**
   - Place your images in `public/images/`
   - Images with EXIF GPS data will automatically have location extracted
   - Images with EXIF date/time will automatically have observation time set

5. **Start the development server:**
   ```bash
   npm run dev
   ```

6. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

7. **Process images via UI:**
   - Click "Analyze All" button to process all unprocessed images
   - Images are processed one at a time with progress indicators
   - Each image is automatically saved after analysis completes
   - Or use the command-line script: `npm run analyze`

## Usage

### Analyzing Images

**Option 1: UI Batch Processing (Recommended)**
1. Add new photos to `public/images/`
2. Open the app in your browser
3. Click the "Analyze All" button in the unprocessed images section
4. Watch as images are processed one at a time with progress indicators
5. Each image is automatically saved after analysis completes
6. Location and date/time are automatically extracted from EXIF data when available

**Option 2: Command-Line Script**
1. Add new photos to `public/images/`
2. Run `npm run analyze`
3. Wait for Gemini to process all images
4. Results are saved to `src/data/mushrooms.json`

### Viewing Results

- **Gallery View**: Browse all identified mushrooms with key information displayed on cards
- **Detail Modal**: Click any mushroom card to open a comprehensive detail view showing:
  - Original photo and AI-generated field guide card side-by-side
  - Full location details with GPS coordinates
  - Weather conditions at time of observation
  - Complete identification features
  - Habitat notes and fun facts
  - Safety warnings and usage information
- **Location Filtering**: Filter mushrooms by collection location
- **Map Explorer**: Click "Map" tab to view all observations on an interactive map
- **Reprocess**: Click "Reprocess" on any card to re-analyze with updated AI models

### Key Features

- **Automatic EXIF Extraction**: GPS coordinates and date/time are automatically extracted from image metadata
- **Reverse Geocoding**: Addresses are automatically fetched from GPS coordinates
- **Weather Data**: Weather conditions are automatically fetched based on location and observation time
- **Info Card Generation**: Each mushroom gets a beautiful AI-generated field guide card
- **Incremental Processing**: Only unprocessed images are shown, preventing duplicate work

## Project Structure

```
web/
├── public/
│   └── images/                    # Your mushroom photos
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── analyze/           # Image analysis API endpoint
│   │   │   ├── images/            # Image listing API endpoint
│   │   │   ├── mushrooms/         # Mushroom data CRUD API
│   │   │   └── weather/            # Weather data API endpoint
│   │   ├── page.tsx                # Main gallery page
│   │   └── layout.tsx              # Root layout
│   ├── components/
│   │   ├── DateTimePicker.tsx      # Date/time selection component
│   │   ├── ImageManager.tsx        # Image upload and batch processing UI
│   │   ├── LocationDisplay.tsx     # Location filtering component
│   │   ├── LocationPicker.tsx      # Google Maps picker
│   │   ├── MushroomCard.tsx        # Individual mushroom card
│   │   ├── MushroomDetailModal.tsx # Detailed mushroom view modal
│   │   ├── ObservationForm.tsx     # Observation editing form
│   │   └── WeatherDisplay.tsx      # Weather information display
│   ├── data/
│   │   └── mushrooms.json          # Generated identification data
│   ├── types/
│   │   └── mushroom.ts             # TypeScript types
│   └── utils/
│       └── api.ts                  # API utility functions
└── scripts/
    └── analyze.mjs                 # Command-line image analysis script
```

## Deployment

### Deploy to Vercel

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy on Vercel:**
   - Import your GitHub repository in Vercel
   - Add environment variables:
     - `GEMINI_API_KEY` (for the analysis script)
     - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` (for the frontend)
   - Deploy!

**Note:** The analysis script (`npm run analyze`) should be run locally or via CI/CD, as it requires file system access to read images and write results. The UI batch processing feature provides a more user-friendly alternative for processing images directly in the browser.

## Safety Disclaimer

⚠️ **Never eat wild mushrooms based solely on AI identification.** Always confirm with a human expert mycologist before consuming any wild mushrooms. This tool is for educational and documentation purposes only.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Google Gemini API](https://ai.google.dev/)
- [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript)
