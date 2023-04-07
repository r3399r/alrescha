CREATE VIEW V_USER as with tmp as (
    select user_id,
        avg(predict_time) as avg,
        count(*) as count
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
    t.count
from "user" u
    left join tmp t on t.user_id = u.id;