package models

import play.api.data.Form
import play.api.data.Forms._


object Order {

  case class Order(id: Int, date: String)

  val orderForm = Form(
    mapping(
      "id" -> number,
      "date" -> text,
    )(Order.apply)(Order.unapply)
  )
}