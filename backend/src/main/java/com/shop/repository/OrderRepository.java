package com.shop.repository;

import com.shop.model.CustomerOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface OrderRepository extends JpaRepository<CustomerOrder, Long> {

    @Query("select distinct o from CustomerOrder o left join fetch o.items order by o.createdAt desc")
    List<CustomerOrder> findAllWithItems();
}
