'use client';

export default function Notifications({ notif }) {
    switch (notif.type) {
        case "follow_request":
            notif.label = <p>New follow request from {notif.user_name}</p>
            break;
        case "group_invitation":
            notif.label = <p>You've been invited to join {notif.group_title}</p>
            break;
        case "join_request":
            notif.label = <p>{notif.user_name} requested to join  {notif.group_title}</p>
            break;
        case "event":
            notif.label = <p>New event created by {notif.user_name} in {notif.group_title}</p>
            break;
    }

    return (

        <div className={`notification-item ${notif.seen ? 'seen' : ''}`} >
            {notif.label}
            <span className="notification-date">{notif.formatted_date}</span>
        </div>
    )
}