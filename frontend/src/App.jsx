import AppRoutes from "./routes/AppRoutes";
import "./styles/Responsive.css"; // 👈 Indha file-ah create panni import pannunga

export default function App() {
  return (
    <AppRoutes /> // 👈 Direct-ah render pannunga, no extra Router!
  );
}