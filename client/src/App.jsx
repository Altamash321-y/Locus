import { useState, useEffect } from "react";

import {
  get_posts_5km,
  get_posts_10km,
  get_posts_25km,
  get_posts_by_city,
  get_posts_by_country,
} from "./lib/supabase";

function App() {
  const [test, setTest] = useState(null);

  useEffect(() => {
    async function runTests() {
      console.log("===== 5 KM POSTS =====");
      const posts5km = await get_posts_5km(28.6139, 77.209);
      console.log(posts5km);

      console.log("===== 10 KM POSTS =====");
      const posts10km = await get_posts_10km(28.6139, 77.209);
      console.log(posts10km);

      console.log("===== 25 KM POSTS =====");
      const posts25km = await get_posts_25km(28.6139, 77.209);
      console.log(posts25km);

      console.log("===== CITY POSTS =====");
      const cityPosts = await get_posts_by_city("Delhi");
      console.log(cityPosts);

      console.log("===== COUNTRY POSTS =====");
      const countryPosts = await get_posts_by_country("India");
      console.log(countryPosts);

      setTest({
        posts5km,
        posts10km,
        posts25km,
        cityPosts,
        countryPosts,
      });
    }

    runTests();
  }, []);

  return (
    <div>
      <h1>Supabase Test</h1>

      <pre>{JSON.stringify(test, null, 2)}</pre>
    </div>
  );
}

export default App;
