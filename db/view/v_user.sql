with tmp as (
    select user_id,
        avg(predict_time) as avg,
        count(*) as count,
        max(date_created) as tmp_date_created,
        max(date_updated) as tmp_date_updated
    from image
    group by user_id
)
select u.id,
    u.name,
    u.quota,
    u.codeformer_fidelity,
    u.background_enhance,
    u.face_upsample,
    u.upscale,
    t.avg,
    t.count,
    greatest(
        t.tmp_date_created,
        t.tmp_date_updated,
        u.date_created,
        u.date_updated
    ) as last_date_updated
from "user" u
    left join tmp t on t.user_id = u.id
order by last_date_updated desc;