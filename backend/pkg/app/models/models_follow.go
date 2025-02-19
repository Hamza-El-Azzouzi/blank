package models

type FollowRequest struct{
	FollowerId string `json:"follower_id"`
	FollowingId string `json:"following_id"`
}