package models

import "time"

type Group struct{
	 GroupTitle string `json:"name"`
	 GroupDescription string `json:"description"`
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

 type GroupRequest struct{
	GroupId string
	UserId string
	Last_Name string
	First_Name string
	
}
type GroupResponse struct {
	User_id string `json:"user_id"`
	Respose string `json:"response"`
}