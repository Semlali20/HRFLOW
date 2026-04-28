package com.innovx.gestionrh.Repository;

import com.innovx.gestionrh.Entity.StageOffer;
import com.innovx.gestionrh.Entity.StageOffer.OfferStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StageOfferRepository extends JpaRepository<StageOffer, Long> {
    List<StageOffer> findByStatus(OfferStatus status);
}
