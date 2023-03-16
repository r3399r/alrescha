CREATE VIEW V_USER AS
with tmp as (
    select user_id,
        avg(predict_time) as avg,
        count(*) as count
    from image
    group by user_id
)
select u.id,
    u.name,
    u.quota,
    t.avg,
    t.count
from tmp t
    left join "user" u on t.user_id = u.id;
