package com.shop.repository;

import com.shop.model.Product;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    /** Empty string means "no filter" for both parameters. */
    @Query("""
            select p from Product p
            where (:category = '' or p.category = :category)
              and (:q = '' or lower(p.name) like lower(concat('%', :q, '%'))
                           or lower(p.description) like lower(concat('%', :q, '%')))
            """)
    List<Product> search(@Param("category") String category, @Param("q") String q, Sort sort);

    /** Row lock so two simultaneous checkouts can never oversell the last unit. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from Product p where p.id = :id")
    Optional<Product> findByIdForUpdate(@Param("id") Long id);

    @Query("select distinct p.category from Product p order by p.category")
    List<String> findCategories();
}
