package models

import "time"

type Group struct{
	 GroupTitle string `json:"name"`
	 GroupDescription string `json:"description"`
}

type GroupInfo struct{
	GroupeId string
	UserId string
	Name string
	IsOwner bool
	Member_count int
	Description string
}

type Groups struct{
	GroupeId string
	UserId string
	Name string
	IsOwner bool
	IsJoined bool
	IsPending bool
	Description string
	Member_count int
 }

 type GroupDetails struct{
	GroupeId string
	UserId string
	IsOwner bool
	IsJoined bool
	IsPending bool
	Name string
	Description string
	Last_Name string
	First_Name string
	Member_count int
	Created_at time.Time
	FormatedDate string
 }