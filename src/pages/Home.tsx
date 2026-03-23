import Hero from "../components/Hero";
import Categories from "../components/Categories";
import Shop from "./Shop";

export default function Home() {
  return (
    <>
      <Hero />
      <Categories />
      <div id="products">
        <Shop />
      </div>
    </>
  );
}
