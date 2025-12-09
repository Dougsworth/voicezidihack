import { CARIBBEAN_COLORS } from "@/constants";

const ComingSoonSection = () => {
  return (
    <section className="py-20 md:py-32" style={{ backgroundColor: CARIBBEAN_COLORS.primary[500] }}>
      <div className="container">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
            Coming Soon to More Caribbean Islands
          </h2>
          <p className="text-xl mb-8 text-white/90">
            We're expanding across the Caribbean! Sign up to be notified when we launch in your area.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-4">
              <div className="text-4xl mb-2">🏝️</div>
              <p className="text-white/90">Trinidad & Tobago</p>
            </div>
            <div className="p-4">
              <div className="text-4xl mb-2">🏝️</div>
              <p className="text-white/90">Barbados</p>
            </div>
            <div className="p-4">
              <div className="text-4xl mb-2">🏝️</div>
              <p className="text-white/90">Guyana</p>
            </div>
            <div className="p-4">
              <div className="text-4xl mb-2">🏝️</div>
              <p className="text-white/90">Bahamas</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ComingSoonSection;