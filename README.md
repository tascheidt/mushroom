# Mushroom Field Notes

A locally generated field guide built from your own mushroom photographs, enriched with identifications from Google Gemini 3. Features interactive location mapping with Google Maps integration.

## Features

- **AI-Powered Identification**: Uses Gemini 3 to identify and categorize mushrooms from your photos
- **Location Tracking**: View and filter mushrooms by collection location
- **Interactive Maps**: Google Maps integration for exploring and selecting locations
- **Rich Data**: Includes scientific names, edibility status, key features, ecological roles, and more
- **Beautiful UI**: Field guide aesthetic with responsive design

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

4. **Run the analysis script:**
   ```bash
   npm run analyze
   ```
   - You'll be prompted to enter the location in the format:
     `[Specific Location/Park], [City/Region], [State/Country], [Habitat Type]`
   - Example: `Forest Park Trail 5, Portland, Oregon, Mixed Conifer Forest`

5. **Start the development server:**
   ```bash
   npm run dev
   ```

6. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### Analyzing Images

1. Add new photos to `public/images/`
2. Run `npm run analyze`
3. Enter the location when prompted (same location will be applied to all images in the batch)
4. Wait for Gemini to process all images
5. Results are saved to `src/data/mushrooms.json`

### Viewing Results

- **Location Display**: See all collection locations and filter by location
- **Map Explorer**: Click "Show Map" to open Google Maps and explore locations
- **Gallery**: Browse all identified mushrooms with detailed information

## Project Structure

```
web/
├── public/
│   └── images/          # Your mushroom photos
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── mushrooms/  # API route for mushroom data
│   │   ├── page.tsx            # Main gallery page
│   │   └── layout.tsx          # Root layout
│   ├── components/
│   │   ├── LocationDisplay.tsx # Location filtering component
│   │   ├── LocationPicker.tsx  # Google Maps picker
│   │   └── MushroomCard.tsx    # Individual mushroom card
│   ├── data/
│   │   └── mushrooms.json      # Generated identification data
│   └── types/
│       └── mushroom.ts          # TypeScript types
└── scripts/
    └── analyze.mjs             # Image analysis script
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

**Note:** The analysis script (`npm run analyze`) should be run locally or via CI/CD, as it requires file system access to read images and write results.

## Safety Disclaimer

⚠️ **Never eat wild mushrooms based solely on AI identification.** Always confirm with a human expert mycologist before consuming any wild mushrooms. This tool is for educational and documentation purposes only.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Google Gemini API](https://ai.google.dev/)
- [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript)
