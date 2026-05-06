package com.innovx.gestionrh.mapper;

import com.innovx.gestionrh.Entity.*;
import com.innovx.gestionrh.dto.response.RefSummary;
import org.mapstruct.Mapper;

/**
 * Shared mapper for converting common entities to lightweight RefSummary objects.
 * Other mappers declare this via uses = {ReferenceMapper.class} so MapStruct
 * automatically applies these conversions for nested entity fields.
 */
@Mapper(componentModel = "spring")
public interface ReferenceMapper {

    default RefSummary toRef(Department department) {
        if (department == null) return null;
        return new RefSummary(department.getId(), department.getName());
    }

    default RefSummary toRef(Position position) {
        if (position == null) return null;
        return new RefSummary(position.getId(), position.getTitle());
    }

    default RefSummary toRef(User user) {
        if (user == null) return null;
        return new RefSummary(user.getId(), user.getFirstName() + " " + user.getLastName());
    }

    default RefSummary toRef(LeaveType leaveType) {
        if (leaveType == null) return null;
        return new RefSummary(leaveType.getId(), leaveType.getName());
    }

    default RefSummary toRef(StageOffer offer) {
        if (offer == null) return null;
        return new RefSummary(offer.getId(), offer.getTitle());
    }

    default RefSummary toRef(Stagiaires intern) {
        if (intern == null) return null;
        return new RefSummary(intern.getId(), intern.getFirstName() + " " + intern.getLastName());
    }

    default RefSummary toRef(Collaborateurs collab) {
        if (collab == null) return null;
        return new RefSummary(collab.getId(), collab.getFirstName() + " " + collab.getLastName());
    }
}
