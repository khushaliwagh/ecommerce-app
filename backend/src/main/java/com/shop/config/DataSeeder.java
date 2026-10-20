package com.shop.config;

import com.shop.model.Product;
import com.shop.repository.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

/** Seeds a catalogue the first time the app starts against an empty database. */
@Component
public class DataSeeder implements CommandLineRunner {

    private static final String IMG = "https://images.unsplash.com/photo-%s?auto=format&fit=crop&w=900&q=80";

    private final ProductRepository repo;

    public DataSeeder(ProductRepository repo) {
        this.repo = repo;
    }

    @Override
    public void run(String... args) {
        if (repo.count() > 0) return;

        repo.saveAll(List.of(
                p("Aurora Wireless Headphones", "Audio", 12999, "1505740420928-5e560c06d30e", 24, 4.8, true, "Bestseller",
                        "Over-ear ANC headphones with 40-hour battery, plush memory-foam cushions and studio-tuned drivers."),
                p("Pulse Smartwatch S2", "Wearables", 8499, "1523275335684-37898b6baf30", 18, 4.6, true, "New",
                        "AMOLED display, GPS, heart-rate and sleep tracking. Five-day battery in a 41 mm aluminium case."),
                p("Stride Runner Red", "Footwear", 5999, "1542291026-7eec264c27ff", 32, 4.7, true, "Trending",
                        "Cushioned daily trainer with a breathable knit upper and a responsive, springy midsole."),
                p("Lumen Mirrorless Camera", "Cameras", 58999, "1526170375885-4d8ecf77b99f", 7, 4.9, true, "Limited",
                        "24 MP mirrorless body with in-body stabilisation, 4K video and a fast hybrid autofocus."),
                p("Nomad Everyday Backpack", "Accessories", 3499, "1553062407-98eeb64c6a62", 40, 4.5, false, null,
                        "Water-resistant 24 L pack with a padded laptop sleeve and hidden quick-access pockets."),
                p("Halo Sunglasses", "Accessories", 2299, "1572635196237-14b3f281503f", 55, 4.3, false, null,
                        "Polarised UV400 lenses in a lightweight acetate frame. Includes a hard travel case."),
                p("Vertex Ultrabook 14", "Computers", 74999, "1496181133206-80ce9b88a853", 9, 4.8, true, "Pro pick",
                        "14-inch 2.8K display, 16 GB RAM, 512 GB SSD. 1.2 kg and all-day battery life."),
                p("Orbit Smartphone X", "Phones", 31999, "1511707171634-5f897ff02aa9", 21, 4.6, false, null,
                        "6.5-inch OLED, triple camera system and 65 W fast charging."),
                p("Ember Bluetooth Speaker", "Audio", 4499, "1608043152269-423dbba4e7e1", 36, 4.4, false, null,
                        "360-degree sound, IP67 water resistance and 20 hours of playtime."),
                p("Tempo Court Sneakers", "Footwear", 4299, "1460353581641-37baddab0fa2", 28, 4.4, false, null,
                        "Low-profile everyday sneakers with a cushioned insole and durable rubber outsole."),
                p("Atelier Eau de Parfum", "Lifestyle", 6499, "1541643600914-78b084683601", 14, 4.7, false, "Gift pick",
                        "Notes of bergamot, cedar and warm amber. 50 ml glass bottle in a keepsake box."),
                p("Keystone Mechanical Keyboard", "Computers", 7999, "1587829741301-dc798b83add3", 20, 4.6, false, null,
                        "75% hot-swappable board with tactile switches, PBT keycaps and a gasket-mounted frame."),
                p("Glide Precision Mouse", "Computers", 2799, "1527864550417-7fd91fc51a46", 45, 4.3, false, null,
                        "Ergonomic wireless mouse with a 26K sensor and a month of battery per charge."),
                p("Classic Steel Watch", "Wearables", 9999, "1524592094714-0f0654e20314", 12, 4.5, false, null,
                        "Sapphire-coated glass, 40 mm stainless-steel case and a soft Italian leather strap."),
                p("Glow Desk Lamp", "Lifestyle", 1999, "1507473885765-e6ed057f782c", 33, 4.2, false, null,
                        "Dimmable warm-to-cool LED lamp with a touch dial and a USB charging port."),
                p("Bean & Brew Ceramic Mug", "Lifestyle", 799, "1514228742587-6b1558fcca3d", 80, 4.1, false, null,
                        "Hand-glazed 350 ml stoneware mug that keeps your coffee warm a little longer."),
                p("Pebble True Wireless Earbuds", "Audio", 3999, "1590658268037-6bf12165a8df", 38, 4.5, false, "Deal",
                        "Pocketable earbuds with active noise cancelling and 30 hours with the charging case.")
        ));
    }

    private Product p(String name, String category, int price, String photoId, int stock,
                      double rating, boolean featured, String badge, String description) {
        Product product = new Product();
        product.setName(name);
        product.setCategory(category);
        product.setPrice(BigDecimal.valueOf(price));
        product.setImageUrl(IMG.formatted(photoId));
        product.setStock(stock);
        product.setRating(rating);
        product.setFeatured(featured);
        product.setBadge(badge);
        product.setDescription(description);
        return product;
    }
}
