User.find({ role: "driver", available: true })
<!-- const orders = Order.find({ status: [pending, accepted, in-progress, on-the-way] })
const users = User.find({ role:"driver", driverId: { $ne: orders.map(e => e.driverId) } }) -->
# Resturants Managment System

1. **List actors** — Who uses the system?
- Customer 
- Driver
- Resturnat Owner

2. **List main actions** — What do they do? 
- Show Resturants
- Show Available Drivers
- Make Order
- Make a Feedback
- Each Resutrenat has sections, and each section has dishes

3. **Find the nouns** — Each important noun often becomes a **collection** 
- User
- Resturant
- Section
- Dish
- Order
- Rate

4. **Draw relationships** 
- Resturant (1) -> (M) Section
- Section (1) -> (M) Dish
- User `Customer` (1) -> (M) Order
- Resturant (1) -> (M) Order
- User `Driver` (1) -> (M) Order
- Dish (M) -> (M) Order
- Resturant (1) -> (M) Rate
- User (1) -> (M) Rate
- Order (1) -> (1) Rate

5. **Name fields by role**
- User {
    name, phone, email, password,
    ?address, ?realtimelocation,
    role [customer, driver, resturantOwner],
    ?available
}
- Resturant {
    title, desc, photo, location, address, hoursWork, avgRate
}
- Section {
    title, desc,
    resturantId (REF: Resturant)
}
- Dish {
    title, desc, photo, price, available,
    sectionId (REF: Section)
}
- Order {
    status [pending, accepted, in-progress, on-the-way, completed, canceled],
    total,
    customerId (REF: User), 
    driverId (REF: User),
    resturantId (REF: Resturant)
}
- Rate {
    stars, ?comment,
    resturantId (REF: Resturant),
    userId (REF: User),
    orderId (REF: Order)
}
- DishOrder {
    dishId (REF: Dish),
    orderId (REF: Order),
    price, count, total, notes
}