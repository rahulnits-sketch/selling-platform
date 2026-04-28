const STORAGE_KEY = "seller_local_cars";
const ADMIN_CONTACT_KEY = "seller_admin_contact";
const defaultAdminContact = { phone: "+15125550123" };

const defaultCars = [
  {
    id: "car-1",
    title: "2022 Honda Civic Sport",
    price: 22950,
    image:
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
    ],
    brand: "Honda",
    year: 2022,
    mileage: "18,400 mi",
    fuel_type: "Petrol",
    transmission: "Automatic",
    location: "Austin, TX",
    description:
      "Single-owner Civic Sport with a clean title, regular service history, and a spotless interior. Great fuel economy and ready for daily driving.",
    phone: "+15125550123",
    is_featured: true,
    status: "available",
    created_date: "2026-03-30T10:00:00.000Z",
  },
  {
    id: "car-2",
    title: "2021 Tesla Model 3 Long Range",
    price: 31900,
    image:
      "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1200&q=80",
    ],
    brand: "Tesla",
    year: 2021,
    mileage: "27,900 mi",
    fuel_type: "Electric",
    transmission: "Automatic",
    location: "San Jose, CA",
    description:
      "Long Range AWD with premium interior, glass roof, and autopilot. Battery and drivetrain feel excellent.",
    phone: "+14155550123",
    is_featured: true,
    status: "available",
    created_date: "2026-03-28T09:30:00.000Z",
  },
  {
    id: "car-3",
    title: "2019 Toyota Fortuner 4x4",
    price: 27400,
    image:
      "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1200&q=80",
    images: [],
    brand: "Toyota",
    year: 2019,
    mileage: "42,000 mi",
    fuel_type: "Diesel",
    transmission: "Manual",
    location: "Dallas, TX",
    description:
      "Well-maintained SUV with 4x4 capability, strong engine, and roomy cabin. Ideal for family trips and weekend adventures.",
    phone: "+12125550123",
    is_featured: false,
    status: "available",
    created_date: "2026-03-22T15:15:00.000Z",
  },
  {
    id: "car-4",
    title: "2018 BMW 320i Luxury Line",
    price: 18900,
    image:
      "https://images.unsplash.com/photo-1549924231-f129b911e442?auto=format&fit=crop&w=1200&q=80",
    images: [],
    brand: "BMW",
    year: 2018,
    mileage: "51,000 mi",
    fuel_type: "Petrol",
    transmission: "Automatic",
    location: "Chicago, IL",
    description:
      "Elegant sedan with premium leather seats, smooth automatic transmission, and recent brake and tire service.",
    phone: "+13125550123",
    is_featured: false,
    status: "sold",
    created_date: "2026-03-15T08:45:00.000Z",
  },
];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function delay(value) {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(clone(value)), 120);
  });
}

function loadCars() {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultCars));
    return clone(defaultCars);
  }

  try {
    return JSON.parse(stored);
  } catch {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultCars));
    return clone(defaultCars);
  }
}

function saveCars(cars) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cars));
}

function sortCars(cars, sort) {
  if (!sort) return cars;
  if (sort === "-created_date") {
    return [...cars].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
  }
  if (sort === "created_date") {
    return [...cars].sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
  }
  return cars;
}

function listCars(sort, limit) {
  const sortedCars = sortCars(loadCars(), sort);
  return typeof limit === "number" ? sortedCars.slice(0, limit) : sortedCars;
}

function createCar(payload) {
  const cars = loadCars();
  const car = {
    ...payload,
    id: `car-${Date.now()}`,
    created_date: new Date().toISOString(),
  };
  cars.unshift(car);
  saveCars(cars);
  return car;
}

function updateCar(id, payload) {
  const cars = loadCars();
  const index = cars.findIndex((car) => car.id === id);
  if (index === -1) {
    throw new Error("Car not found");
  }

  cars[index] = { ...cars[index], ...payload };
  saveCars(cars);
  return cars[index];
}

function deleteCar(id) {
  const cars = loadCars().filter((car) => car.id !== id);
  saveCars(cars);
  return { success: true };
}

async function uploadFile({ file }) {
  return delay({ file_url: URL.createObjectURL(file) });
}

function loadAdminContact() {
  const stored = window.localStorage.getItem(ADMIN_CONTACT_KEY);

  if (stored === null) {
    window.localStorage.setItem(ADMIN_CONTACT_KEY, JSON.stringify(defaultAdminContact));
    return clone(defaultAdminContact);
  }

  try {
    return JSON.parse(stored);
  } catch {
    window.localStorage.setItem(ADMIN_CONTACT_KEY, JSON.stringify(defaultAdminContact));
    return clone(defaultAdminContact);
  }
}

function saveAdminContact(contact) {
  window.localStorage.setItem(ADMIN_CONTACT_KEY, JSON.stringify(contact));
}

async function getAdminContact() {
  const contact = loadAdminContact();
  if (contact?.phone && contact.phone.trim()) {
    return delay(contact);
  }
  return delay(null);
}

async function setAdminContact(contact) {
  saveAdminContact(contact);
  return delay(contact);
}

async function clearAdminContact() {
  saveAdminContact({ phone: "" });
  return delay(null);
}

async function getCurrentUser() {
  return delay({
    id: "local-admin",
    name: "Local Admin",
    email: "local@seller.app",
    role: "admin",
  });
}

export const appClient = {
  entities: {
    Car: {
      list: async (sort, limit) => delay(listCars(sort, limit)),
      create: async (payload) => delay(createCar(payload)),
      update: async (id, payload) => delay(updateCar(id, payload)),
      delete: async (id) => delay(deleteCar(id)),
    },
  },
  integrations: {
    Core: {
      UploadFile: uploadFile,
    },
  },
  admin: {
    getContact: getAdminContact,
    setContact: setAdminContact,
    clearContact: clearAdminContact,
  },
  auth: {
    me: getCurrentUser,
    redirectToLogin: () => {},
    logout: () => {},
  },
};
