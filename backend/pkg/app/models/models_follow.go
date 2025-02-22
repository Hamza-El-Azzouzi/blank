package models

type FollowRequest struct {
	FollowerId  string `json:"follower_id"`
	FollowingId string `json:"following_id"`
}

type FollowListResponse struct {
	FollowList []FollowList `json:"follow_list"`
	TotalCount int          `json:"total_count"`
}

type FollowList struct {
	UserId    string `json:"user_id"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Avatar    string `json:"avatar"`
}
