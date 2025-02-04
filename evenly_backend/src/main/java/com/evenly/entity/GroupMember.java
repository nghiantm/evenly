package com.evenly.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.sql.Date;

@Entity
@Table(name = "`group_members`")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class GroupMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // Primary key for JPA, not required in original design

    @Column(nullable = false)
    private String groupId;

    @Column(nullable = false)
    private String userId;

    @Column(nullable = false)
    private Date addDate;

    @Column(nullable = false)
    private String addedByUserId;

}
