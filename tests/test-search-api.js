async function testSearch() {
    const params = {
        destination: "Đà Lạt",
        departure: "TP.Hồ Chí Minh",
        startDateRange: "2025-07-01",
        endDateRange: "2025-08-31",
        preferredDate: "2025-07-31"
    };
    
    console.log('🔍 Testing search with params:', params);
    
    try {
        // Step 1: Fetch all tours
        const toursResponse = await fetch('http://localhost:5000/api/tours');
        const toursData = await toursResponse.json();
        console.log(`📊 API Response:`, toursData);
        console.log(`📊 Response type:`, typeof toursData);
        console.log(`📊 Is array:`, Array.isArray(toursData));
        
        // Handle different response formats
        let tours = [];
        if (Array.isArray(toursData)) {
            tours = toursData;
        } else if (toursData && Array.isArray(toursData.data)) {
            tours = toursData.data;
        } else if (toursData && Array.isArray(toursData.tours)) {
            tours = toursData.tours;
        } else {
            console.log('❌ API response is not in expected format');
            return;
        }
        
        console.log(`📊 Total tours: ${tours.length}`);
        
        if (tours.length > 0) {
            console.log('📋 Sample tour fields:', Object.keys(tours[0]));
            console.log('📋 Sample tours with location data:', 
                tours.slice(0, 5).map(t => ({
                    id: t.id,
                    name: t.name,
                    location: t.location,
                    destination: t.destination,
                    departure_location: t.departure_location
                }))
            );
        }
        
        // Step 2: Filter by destination
        let filteredTours = tours.filter(tour =>
            (tour.name && tour.name.toLowerCase().includes("đà lạt")) ||
            (tour.location && tour.location.toLowerCase().includes("đà lạt")) ||
            (tour.destination && tour.destination.toLowerCase().includes("đà lạt"))
        );
        console.log(`🎯 After destination filter: ${filteredTours.length} tours`);
        
        if (filteredTours.length > 0) {
            console.log('🎯 Tours matching Đà Lạt:', 
                filteredTours.map(t => ({
                    name: t.name,
                    location: t.location,
                    destination: t.destination
                }))
            );
        }
        
        // Step 3: Filter by departure
        filteredTours = filteredTours.filter(tour => 
            (tour.departure_location && tour.departure_location.toLowerCase().includes("tp.hồ chí minh")) ||
            (tour.departure_location && tour.departure_location.toLowerCase().includes("hồ chí minh")) ||
            (tour.departure_location && tour.departure_location.toLowerCase().includes("ho chi minh"))
        );
        console.log(`🚗 After departure filter: ${filteredTours.length} tours`);
        
        if (filteredTours.length > 0) {
            console.log('🚗 Tours from TP.HCM to Đà Lạt:', 
                filteredTours.map(t => ({
                    name: t.name,
                    departure_location: t.departure_location
                }))
            );
            
            // Step 4: Check departure dates for these tours
            for (const tour of filteredTours) {
                try {
                    const datesResponse = await fetch(`http://localhost:5000/api/departure-dates/by-tour/${tour.id}`);
                    const dates = await datesResponse.json();
                    
                    console.log(`📅 Dates for "${tour.name}":`, dates);
                    
                    if (Array.isArray(dates) && dates.length > 0) {
                        const matchingDates = dates.filter(date => {
                            const departureDate = new Date(date.departure_date);
                            const startRange = new Date("2025-07-01");
                            const endRange = new Date("2025-08-31");
                            return departureDate >= startRange && departureDate <= endRange;
                        });
                        
                        console.log(`📅 Matching dates for "${tour.name}":`, matchingDates);
                    }
                } catch (error) {
                    console.error(`❌ Error fetching dates for tour ${tour.id}:`, error);
                }
            }
        } else {
            console.log('❌ No tours found matching both destination and departure criteria');
            
            // Debug: Check if ANY tours have departure_location field
            const toursWithDeparture = tours.filter(t => t.departure_location);
            console.log(`🔍 Tours with departure_location field: ${toursWithDeparture.length}`);
            if (toursWithDeparture.length > 0) {
                console.log('🔍 Sample departure locations:', 
                    [...new Set(toursWithDeparture.map(t => t.departure_location))].slice(0, 10)
                );
            }
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Run the test
testSearch();
