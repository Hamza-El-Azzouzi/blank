package models

import "time"

type Group struct {
	GroupTitle       string `json:"name"`
	GroupDescription string `json:"description"`
}

type GroupDetails struct {
	GroupeId     string
	UserId       string
	IsOwner      bool
	IsJoined     bool
	IsPending    bool
	Name         string
	Description  string
	Last_Name    string
	First_Name   string
	Member_count int
	Created_at   time.Time
	FormatedDate string
	TotalCount   int
}

type GroupRequest struct {
	GroupId    string
	UserId     string
	Last_Name  string
	First_Name string
	TotalCount int
}
type GroupResponse struct {
	User_id string `json:"user_id"`
	Respose string `json:"response"`
}
type GroupInvite struct {
	UserId  string `json:"user_id"`
	GroupId string `json:"group_id"`
}
type GroupPost struct {
	Post_id       string    `json:"post_id"`
	Group_id      string    `json:"groupId"`
	Content       string    `json:"content"`
	Image         string    `json:"image"`
	CreatedAt     time.Time `json:"created_at"`
	User_id       string    `json:"user_id"`
	FirstName     string    `json:"first_name"`
	LastName      string    `json:"last_name"`
	CommentCount  string    `json:"comment_count"`
	LikeCount     int       `json:"like_count"`
	TotalCount    int       `json:"total_count"`
	FormattedDate string    `json:"formatted_date"`
	HasLiked      bool      `json:"has_liked"`
	Avatar        string    `json:"avatar"`
}

type Event struct {
	Event_id    string `json:"event_id"`
	Group_id    string `json:"group_id"`
	Group_title string `json:"group_title"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Date        string `json:"date"`
	Time        string `json:"time"`
	User_id     string `json:"user_id"`
	Is_going    bool   `json:"is_going"`
	Going_count int    `json:"going_count"`
	Respose     string `json:"response"`
	TotalCount  int
}
